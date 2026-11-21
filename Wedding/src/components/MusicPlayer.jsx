import { useCallback, useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play, SkipBack, SkipForward } from 'lucide-react';

import { TRACKS } from '../config/music.js';
import { gsap } from '../lib/gsap.js';
import GoldFrame from './GoldFrame.jsx';

/**
 * The invitation's music.
 *
 * A compact launcher sits in the lower-left corner — the same glass, gold
 * hairline and scale as the auto-scroll capsule opposite it. Tapping it opens
 * a small glass panel holding the whole two-track player: previous, play/pause,
 * next, a draggable seek bar and both timestamps.
 *
 * Playback state is taken from the `<audio>` element's own events, never
 * guessed, so the control can never claim to be playing when it is not. There
 * is exactly one audio element for the whole page, and the tracks are swapped
 * through it.
 */

const STEP_SECONDS = 5;

/** `m:ss`, or `mm:ss` once a song passes ten minutes. */
function formatTime(seconds) {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const whole = Math.floor(safe);
  return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(
    whole % 60,
  ).padStart(2, '0')}`;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function MusicPlayer() {
  const [index, setIndex] = useState(0);
  // 'idle' | 'playing' | 'paused' | 'blocked' | 'error'
  const [status, setStatus] = useState('idle');
  const [duration, setDuration] = useState(0);
  const [open, setOpen] = useState(false);

  const audioRef = useRef(null);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const labelRef = useRef(null);
  const timeRef = useRef(null);
  const fillRef = useRef(null);
  const knobRef = useRef(null);
  const barRef = useRef(null);
  const prevIconRef = useRef(null);
  const nextIconRef = useRef(null);
  const draggingRef = useRef(false);

  // Should the player keep playing across a track change? True until the
  // browser refuses the automatic start, so a blocked guest is never retried.
  const wantsAudioRef = useRef(true);
  const aliveRef = useRef(true);

  const playing = status === 'playing';

  /**
   * Writes the playhead straight into the DOM. Time updates arrive four times a
   * second; painting them by hand keeps that entirely out of React's render
   * path, so playback never re-renders the tree.
   */
  const paint = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const total = Number.isFinite(audio.duration) ? audio.duration : 0;
    const played = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const ratio = total > 0 ? Math.min(1, Math.max(0, played / total)) : 0;

    if (fillRef.current) {
      fillRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
    }
    if (knobRef.current) {
      knobRef.current.style.left = `${(ratio * 100).toFixed(2)}%`;
    }
    if (timeRef.current) {
      timeRef.current.textContent = formatTime(played);
    }
    if (barRef.current) {
      barRef.current.setAttribute('aria-valuenow', String(Math.round(played)));
      barRef.current.setAttribute(
        'aria-valuetext',
        `${formatTime(played)} of ${formatTime(total)}`,
      );
    }
  }, []);

  /**
   * Asks the browser to play. A refusal is expected behaviour on the automatic
   * open (no gesture), so it is reported quietly as `blocked` rather than
   * thrown — and it is never retried on a loop.
   */
  const start = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      if (!aliveRef.current) return;
      wantsAudioRef.current = true;
      setStatus('playing');
    } catch (error) {
      if (!aliveRef.current) return;

      // A track change aborted this request; the new one is already on its way.
      if (error?.name === 'AbortError') return;

      wantsAudioRef.current = false;
      setStatus(error?.name === 'NotAllowedError' ? 'blocked' : 'paused');
    }
  }, []);

  // Lifecycle. Declared first, so the flag is set before the effects below run.
  useEffect(() => {
    aliveRef.current = true;
    const audio = audioRef.current;

    return () => {
      aliveRef.current = false;
      if (!audio) return;

      audio.pause();
      // Drop the source, so a closed page stops streaming the track.
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  // The audio element owns the truth about playback.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onTime = () => paint();

    const onTiming = () => {
      if (!aliveRef.current) return;
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      paint();
    };

    const onPlay = () => {
      if (aliveRef.current) setStatus('playing');
    };

    const onPause = () => {
      if (!aliveRef.current) return;
      // A source swap pauses the element on its way to the next track. That is
      // not the guest pausing, so the status is left to the incoming request.
      if (!audio.error) {
        setStatus((previous) => (previous === 'error' ? previous : 'paused'));
      }
    };

    const onEnded = () => {
      if (!aliveRef.current) return;
      // Straight on to the next song, and back to the first after the last.
      wantsAudioRef.current = true;
      setIndex((previous) => (previous + 1) % TRACKS.length);
    };

    const onError = () => {
      if (aliveRef.current) setStatus('error');
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onTiming);
    audio.addEventListener('durationchange', onTiming);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onTiming);
      audio.removeEventListener('durationchange', onTiming);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [paint]);

  // Load the selected song. On the very first run this is also the automatic
  // attempt that greets the guest as the invitation opens.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = TRACKS[index].src;
    audio.load();
    paint();

    if (wantsAudioRef.current) void start();
  }, [index, paint, start]);

  // The panel breathes in and out above the launcher.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (prefersReducedMotion()) {
      gsap.set(panel, { autoAlpha: open ? 1 : 0, y: open ? 0 : 10, scale: 1 });
      return;
    }

    gsap.to(panel, {
      autoAlpha: open ? 1 : 0,
      y: open ? 0 : 10,
      scale: open ? 1 : 0.97,
      duration: open ? 0.5 : 0.32,
      ease: open ? 'power3.out' : 'power2.in',
      overwrite: 'auto',
    });
  }, [open]);

  /**
   * Dismiss on an outside press.
   *
   * Only attached while the panel is open, and in the capture phase so nothing
   * on the page can swallow the first press. Because the listener is added in
   * an effect — after the click that opened the panel has already dispatched
   * its `pointerdown` — opening can never immediately close itself, and a press
   * anywhere inside the player is ignored so the transport keeps working.
   *
   * It only changes what is visible: playback is untouched and carries on in
   * the background.
   */
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node)) return;
      if (root.contains(event.target)) return;
      setOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // The track name settles in each time the song changes.
  useEffect(() => {
    const label = labelRef.current;
    if (!label || prefersReducedMotion()) return;

    gsap.fromTo(
      label,
      { opacity: 0, x: -6 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' },
    );
  }, [index]);

  /** A small nod from the arrow that was pressed. */
  function nudge(direction) {
    const icon = direction < 0 ? prevIconRef.current : nextIconRef.current;
    if (!icon || prefersReducedMotion()) return;

    gsap.fromTo(
      icon,
      { x: direction * 4, opacity: 0.5 },
      { x: 0, opacity: 1, duration: 0.34, ease: 'power2.out', overwrite: 'auto' },
    );
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    wantsAudioRef.current = true;
    void start();
  }

  /**
   * Steps to the neighbouring track. Playback intent carries over: a guest who
   * is listening keeps listening, a guest who paused stays paused, and a guest
   * whose automatic start was blocked has clearly asked for music.
   */
  function step(direction) {
    const audio = audioRef.current;
    const wasPlaying = audio ? !audio.paused : false;

    wantsAudioRef.current = wasPlaying || status === 'blocked';
    setIndex(
      (previous) => (previous + direction + TRACKS.length) % TRACKS.length,
    );
    nudge(direction);
  }

  function openPanel() {
    const next = !open;
    setOpen(next);

    // Opening the player is the guest's first real gesture on it, so a start
    // the browser held back begins right here.
    if (next && status === 'blocked') {
      wantsAudioRef.current = true;
      void start();
    }
  }

  function seekTo(clientX) {
    const audio = audioRef.current;
    const bar = barRef.current;
    if (!audio || !bar) return;

    const total = audio.duration;
    if (!Number.isFinite(total) || total <= 0) return;

    const box = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    audio.currentTime = ratio * total;
    paint();
  }

  function handlePointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    draggingRef.current = true;
    barRef.current?.classList.add('is-dragging');
    event.currentTarget.setPointerCapture?.(event.pointerId);
    seekTo(event.clientX);
  }

  function handlePointerMove(event) {
    if (!draggingRef.current) return;
    seekTo(event.clientX);
  }

  function handlePointerUp(event) {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    barRef.current?.classList.remove('is-dragging');
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function handleBarKeyDown(event) {
    const audio = audioRef.current;
    if (!audio) return;

    const total = Number.isFinite(audio.duration) ? audio.duration : 0;
    let target = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      target = Math.min(total, audio.currentTime + STEP_SECONDS);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      target = Math.max(0, audio.currentTime - STEP_SECONDS);
    } else if (event.key === 'Home') {
      target = 0;
    } else if (event.key === 'End') {
      target = total;
    }

    if (target === null) return;

    event.preventDefault();
    audio.currentTime = target;
    paint();
  }

  return (
    <div className={`music${playing ? ' is-playing' : ''}`} ref={rootRef}>
      <button
        className="music__launch"
        type="button"
        onClick={openPanel}
        aria-expanded={open}
        aria-controls="wedding-music"
        aria-label="Wedding music"
        title={playing ? 'Wedding music' : 'Play wedding music'}
      >
        <GoldFrame tone="rich" />
        {playing ? (
          <Music2 size={13} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Play size={13} strokeWidth={1.75} aria-hidden="true" />
        )}
        {playing ? <span className="music__spark" aria-hidden="true" /> : null}
      </button>

      <div className="music__panel" id="wedding-music" ref={panelRef}>
        <GoldFrame sweep />
        <div className="music__head">
          <span className="music__track" ref={labelRef}>
            {TRACKS[index].label}
          </span>
          <span className="music__time">
            <span ref={timeRef}>00:00</span>
            <span className="music__time-sep" aria-hidden="true">
              /
            </span>
            <span>{formatTime(duration)}</span>
          </span>
        </div>

        <div
          className="music__bar"
          ref={barRef}
          role="slider"
          tabIndex={0}
          aria-label="Seek within the song"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleBarKeyDown}
        >
          <span className="music__bar-track" aria-hidden="true" />
          <span className="music__bar-fill" ref={fillRef} aria-hidden="true" />
          <span className="music__bar-knob" ref={knobRef} aria-hidden="true" />
        </div>

        <div className="music__controls">
          <button
            className="music__btn"
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous song"
            title="Previous song"
          >
            <span className="music__icon" ref={prevIconRef}>
              <SkipBack size={12} strokeWidth={1.75} aria-hidden="true" />
            </span>
          </button>

          <button
            className="music__btn music__btn--play"
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause music' : 'Play music'}
            title={playing ? 'Pause music' : 'Play music'}
          >
            <span className="music__icon" key={playing ? 'pause' : 'play'}>
              {playing ? (
                <Pause size={13} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Play size={13} strokeWidth={1.75} aria-hidden="true" />
              )}
            </span>
          </button>

          <button
            className="music__btn"
            type="button"
            onClick={() => step(1)}
            aria-label="Next song"
            title="Next song"
          >
            <span className="music__icon" ref={nextIconRef}>
              <SkipForward size={12} strokeWidth={1.75} aria-hidden="true" />
            </span>
          </button>
        </div>

        {status === 'error' ? (
          <p className="music__notice" role="status">
            This song could not be loaded.
          </p>
        ) : null}
      </div>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}

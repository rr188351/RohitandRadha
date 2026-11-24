import { useCallback, useEffect, useRef, useState } from 'react';

import AutoScrollController from './components/AutoScrollController.jsx';
import CelebrationSection from './components/CelebrationSection.jsx';
import ClosingSection from './components/ClosingSection.jsx';
import EventShowcase from './components/EventShowcase.jsx';
import GallerySection from './components/GallerySection.jsx';
import GuestWall from './components/GuestWall.jsx';
import InvitationIntro from './components/InvitationIntro.jsx';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';
import MusicPlayer from './components/MusicPlayer.jsx';
import RSVPSection from './components/RSVPSection.jsx';
import TimelineEvent from './components/TimelineEvent.jsx';
import ViewportFrame from './components/ViewportFrame.jsx';
import WeddingHero from './components/WeddingHero.jsx';
import WeddingTimeline from './components/WeddingTimeline.jsx';
import { AUTO_OPEN_DELAY } from './lib/autoScroll.js';

/**
 * Root application shell and phase orchestrator.
 *
 * Phase 01 (the invitation card) and Phase 02 (the wedding hero) are stacked
 * over one another so the atmospheric backdrop inside `InvitationIntro` is
 * never unmounted — the petals, dust and candlelight simply continue across
 * the reveal instead of restarting.
 *
 * `isOpen` drives both halves of the choreography: the card runs its exit
 * timeline while the hero runs its reveal timeline, timed to read as a single
 * continuous transition.
 */
function App() {
  const [isOpen, setIsOpen] = useState(false);
  // A ref guard, not just state: it blocks a second click that arrives before
  // React has committed the state update.
  const hasOpenedRef = useRef(false);

  const handleOpen = useCallback(() => {
    if (hasOpenedRef.current) return;
    hasOpenedRef.current = true;
    setIsOpen(true);
  }, []);

  // The invitation invites the guest in by itself after a few quiet seconds.
  // A manual press always wins (its cleanup clears this timer), and the guard
  // above means the opening can only ever happen once.
  useEffect(() => {
    if (isOpen) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const timer = window.setTimeout(handleOpen, AUTO_OPEN_DELAY);
    return () => window.clearTimeout(timer);
  }, [isOpen, handleOpen]);

  return (
    <main className={`app${isOpen ? ' is-open' : ''}`}>
      <InvitationIntro isOpen={isOpen} onOpen={handleOpen} />
      <WeddingHero isOpen={isOpen} />
      {/* Phase 03 mounts only once the invitation is open. Until then the page
          is exactly one viewport tall, so Phase 01 stays a locked screen with
          no scrollbar and nothing below the fold is revealed early. */}
      {isOpen && <CelebrationSection />}
      {isOpen && <EventShowcase />}
      {isOpen && <GallerySection />}
      {isOpen && <WeddingTimeline />}
      {isOpen && <RSVPSection />}
      {/* Phase 19 — the names of everyone who accepted, read from the public,
          read-only endpoint. It sits after the RSVP so a guest who has just
          replied meets the wall their own name has just joined. */}
      {isOpen && <GuestWall />}
      {isOpen && <ClosingSection />}
      <AutoScrollController isOpen={isOpen} />
      {/* The music joins the invitation with its opening, and picks up the
          guest's own gesture when the browser holds the automatic start back. */}
      {isOpen && <MusicPlayer />}
      {/* The ornamental frame around the whole screen. It is fixed, purely
          decorative, and never takes a pointer event. */}
      <ViewportFrame />
      {/* The language switcher sits in the top-left corner, inside the frame and
          clear of the music pill (bottom-left) and the auto-scroll capsule
          (bottom-right). It is available from the very first screen. */}
      <LanguageSwitcher />
    </main>
  );
}

export default App;

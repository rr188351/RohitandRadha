/**
 * Phase 05 — the memories gallery.
 *
 * ---------------------------------------------------------------------------
 * TEMPORARY PLACEHOLDER PHOTOGRAPHY — NOT ROHIT AND RADHA
 * ---------------------------------------------------------------------------
 * The four photographs below are stock images from Pexels, used under the
 * Pexels License (free for commercial and non-commercial use, no attribution
 * required). They were chosen only to demonstrate the gallery design and do not
 * depict the couple. Each entry keeps its original source page for provenance.
 *
 * To use the real photographs, drop them into `public/images/gallery/` and keep
 * the same filenames, or point `src` at the new files here — and update the
 * `alt` text so it no longer says "Placeholder image". Nothing else changes.
 * ---------------------------------------------------------------------------
 */

/** Builds a public-folder URL that also works under the GitHub Pages base path. */
const galleryImage = (file) => `${import.meta.env.BASE_URL}images/gallery/${file}`;

export const gallery = {
  label: 'The Art of Togetherness',
  titleLead: 'Moments',
  titleAccentLead: 'Made',
  titleAccent: 'Eternal',
  intro:
    'Every glance, every smile, every little moment becomes a memory worth keeping forever.',

  images: [
    {
      id: 'lead',
      src: galleryImage('indian-couple-portrait.jpg'),
      alt: 'Placeholder image: a couple in traditional Indian attire photographed outdoors',
      credit: 'Pexels',
      source:
        'https://www.pexels.com/photo/traditional-indian-engagement-couple-portrait-outdoors-39625024/',
    },
    {
      id: 'bride',
      src: galleryImage('indian-bride-portrait.jpg'),
      alt: 'Placeholder image: an Indian bride in traditional attire',
      credit: 'Pexels',
      source:
        'https://www.pexels.com/photo/elegant-indian-bride-in-traditional-attire-34479807/',
    },
    {
      id: 'ceremony',
      src: galleryImage('indian-couple-ceremony.jpg'),
      alt: 'Placeholder image: a couple embracing during an Indian wedding ceremony',
      credit: 'Pexels',
      source:
        'https://www.pexels.com/photo/beautiful-indian-wedding-couple-embracing-tradition-36248917/',
    },
    {
      id: 'detail',
      src: galleryImage('indian-henna-hands.jpg'),
      alt: 'Placeholder image: hands decorated with henna at an Indian wedding',
      credit: 'Pexels',
      source:
        'https://www.pexels.com/photo/traditional-indian-wedding-henna-hands-holding-34479816/',
    },
  ],
};

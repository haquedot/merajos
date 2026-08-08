import { MetadataRoute } from 'next';
import { BRAND } from '../lib/branding';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — ${BRAND.tagline}`,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0F19',
    theme_color: '#1F3B99',
    orientation: 'portrait',
    icons: [
      {
        src: '/logos/orbit-light-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logos/orbit-light-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

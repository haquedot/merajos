import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { MainLayout } from '../components/layout/MainLayout';
import { QueryProvider } from '../providers/QueryProvider';
import { GoogleAuthProvider } from '../providers/GoogleAuthProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { BRAND } from '../lib/branding';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
  icons: {
    icon: '/logos/orbit-light-icon.png',
    shortcut: '/logos/orbit-light-icon.png',
    apple: '/logos/orbit-light-icon.png',
  },
  keywords: [
    'productivity',
    'orbit',
    'task management',
    'calendar',
    'habits',
    'projects',
    'research',
    'career',
  ],
  authors: [{ name: 'Orbit Team' }],
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        <link rel="icon" href="/logos/orbit-light-icon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logos/orbit-light-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('meraj_os_theme');
                  var theme = saved || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-150" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            <GoogleAuthProvider>
              <MainLayout>{children}</MainLayout>
            </GoogleAuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

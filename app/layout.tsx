import type { Metadata, Viewport } from 'next';
import { Manrope, Geist } from 'next/font/google';
import './globals.css';
import { MainLayout } from '../components/layout/MainLayout';
import { QueryProvider } from '../providers/QueryProvider';
import { GoogleAuthProvider } from '../providers/GoogleAuthProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { PWARegister } from '../components/pwa/PWARegister';
import { PWAInstallPrompt } from '../components/pwa/PWAInstallPrompt';
import { BRAND } from '../lib/branding';
import { cn } from "@/lib/utils";
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'react-hot-toast';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const ogImage = `/og-image.webp`;

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  themeColor: '#1F3B99',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: BRAND.name,
  },
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
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: BRAND.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    images: [ogImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "light", manrope.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        <link rel="icon" href="/logos/orbit-light-icon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logos/orbit-light-icon.png" />
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('meraj_os_theme');
                  var theme = saved || 'light';
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
        <PWARegister />
        <QueryProvider>
          <ThemeProvider>
            <GoogleAuthProvider>
              <TooltipProvider>
                <MainLayout>{children}</MainLayout>
                <PWAInstallPrompt />
                <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
              </TooltipProvider>
            </GoogleAuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

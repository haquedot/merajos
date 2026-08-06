import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { MainLayout } from '../components/layout/MainLayout';
import { QueryProvider } from '../providers/QueryProvider';
import { GoogleAuthProvider } from '../providers/GoogleAuthProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Meraj OS — Personal Productivity Dashboard',
  description: 'A modern, premium personal operating system synced with Google Calendar and Google Tasks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <GoogleAuthProvider>
            <MainLayout>{children}</MainLayout>
          </GoogleAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

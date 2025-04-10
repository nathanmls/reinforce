import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from './context/AuthContext';
import { ScrollProvider } from './context/ScrollContext';
import { CameraDebugProvider } from './context/CameraDebugContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Voice Assistant',
  description: 'Your AI voice assistant',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ScrollProvider>
            <CameraDebugProvider>{children}</CameraDebugProvider>
          </ScrollProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

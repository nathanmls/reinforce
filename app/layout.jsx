import { Inter } from 'next/font/google';
import './globals.css';
import { FirebaseProvider } from './components/FirebaseProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Reinforce',
  description: 'Reinforce - Sua Mentora Virtual',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="min-h-screen overflow-x-hidden">
        <FirebaseProvider>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
        </FirebaseProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

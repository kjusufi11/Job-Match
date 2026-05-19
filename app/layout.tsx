import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from './providers';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Matcht — Find the job that actually fits you',
  description: 'Build one profile. Get matched to roles based on skills, personality, salary, and culture.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <UserProvider>
          <Nav />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}

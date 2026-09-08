import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zoned',
  description: 'Recovery, strain and sleep from a sensor you built yourself.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

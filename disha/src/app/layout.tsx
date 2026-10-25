import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Disha (दिशा) — Career Guidance for Indian Students',
  description:
    'Discover careers that match your interests and strengths. Evidence-backed guidance, prerequisites, and resources for Class 9–12 students in India.',
  keywords: [
    'career guidance',
    'Indian students',
    'career quiz',
    'RIASEC',
    'stream selection',
    'class 10',
    'class 12',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

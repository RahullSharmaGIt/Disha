import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disha Backend API',
  description: 'REST API service for Disha career guidance platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

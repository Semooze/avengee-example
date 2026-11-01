import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Avengee — Ideas made real', template: '%s | Avengee' },
  description:
    'Explore thoughtful digital experiences. Discover Serein, a complete boutique hotel booking demo by Avengee.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

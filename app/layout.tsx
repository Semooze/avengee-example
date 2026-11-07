import type { Metadata } from 'next';
import { Anuphan, Bai_Jamjuree, Bricolage_Grotesque, Newsreader } from 'next/font/google';
import './globals.css';

// Anuphan (Cadson Demak) carries both Thai and a matching Latin, so mixed
// Thai/English lines share one rhythm. It is the text face everywhere.
const text = Anuphan({
  subsets: ['thai', 'latin'],
  variable: '--font-text',
  display: 'swap',
});
// Display voice for the Avengee frame: Bricolage Grotesque for Latin, and
// Bai Jamjuree (Cadson Demak) for Thai headings; its squared, upright Thai
// forms echo Bricolage's crisp grotesque shapes.
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'wdth'],
});
const displayThai = Bai_Jamjuree({
  subsets: ['thai'],
  weight: ['500', '600'],
  variable: '--font-display-thai',
  display: 'swap',
});
const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['opsz'],
});

const description =
  'เราออกแบบและพัฒนาดิจิทัลโปรดักต์ ตั้งแต่ตั้งโจทย์จนถึงระบบที่ใช้งานได้จริง · Avengee designs and builds digital products, from first idea to working software.';

export const metadata: Metadata = {
  title: { default: 'Avengee — Ideas made real', template: '%s | Avengee' },
  description,
  openGraph: {
    title: 'Avengee — Ideas made real',
    description,
    siteName: 'Avengee',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      data-scroll-behavior="smooth"
      className={`${text.variable} ${display.variable} ${displayThai.variable} ${serif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

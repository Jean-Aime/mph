import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sankore Retreat | A private forest sanctuary',
  description: 'A quiet collection of forest villas, shaped by the landscape and made for a deeper kind of escape.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

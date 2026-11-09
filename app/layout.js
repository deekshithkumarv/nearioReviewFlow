import './globals.css';
import { SvgSprite } from './components/Icons';

export const metadata = {
  title: 'Neario ReviewFlow | Turn real customer smiles into 5-star Google reviews',
  description: 'Neario ReviewFlow helps Indian retail, clinics, salons, and restaurants turn happy in-store guests into 5-star Google reviews while keeping negative feedback private.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SvgSprite />
        <div id="toasts" className="toasts" aria-live="polite" aria-atomic="true"></div>
        {children}
      </body>
    </html>
  );
}

import { MotionProvider } from '../../components/ui/Motion';
import { Noto_Sans_Devanagari, Noto_Sans_Kannada } from 'next/font/google';
import s from './feedback.module.css';

// Hindi and Kannada fonts for the customer page. Not preloaded: the browser fetches them only
// when Devanagari or Kannada text is on screen, so English visitors download nothing extra.
const deva = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-deva',
  preload: false,
});
const kannada = Noto_Sans_Kannada({
  subsets: ['kannada'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-kannada',
  preload: false,
});

export const metadata = {
  title: 'Share your feedback',
  description: 'Tell the business how your visit went. It takes under a minute.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }) {
  return (
    <MotionProvider>
      <div className={`${deva.variable} ${kannada.variable} ${s.fonts}`}>{children}</div>
    </MotionProvider>
  );
}

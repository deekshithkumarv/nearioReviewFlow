import { MotionProvider } from '../components/ui/Motion';

export const metadata = {
  title: 'Set up your business',
  robots: { index: false, follow: false },
};

export default function Layout({ children }) {
  return <MotionProvider>{children}</MotionProvider>;
}

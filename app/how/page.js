import LandingPage from '../components/LandingPage';

export const metadata = {
  title: 'How it works',
  description: 'From a QR scan to a clear next step, in three steps.',
  alternates: { canonical: '/how' },
};

export default function HowPage() {
  return <LandingPage initialSection="how" />;
}

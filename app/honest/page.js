import LandingPage from '../components/LandingPage';

export const metadata = {
  title: 'Honest reviews',
  description: 'Every customer gets the same Google review link. No review gating, no invented reviews.',
  alternates: { canonical: '/honest' },
};

export default function HonestPage() {
  return <LandingPage initialSection="honest" />;
}

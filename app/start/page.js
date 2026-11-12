import LandingPage from '../components/LandingPage';

export const metadata = {
  title: 'Get started',
  description: 'Tell us about your business and we will set up your Neario workspace.',
  alternates: { canonical: '/start' },
};

export default function StartPage() {
  return <LandingPage initialSection="start" />;
}

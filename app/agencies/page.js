import LandingPage from '../components/LandingPage';

export const metadata = {
  title: 'For agencies',
  description: 'Run customer feedback for all your clients from one login. Every client pays Neario directly.',
  alternates: { canonical: '/agencies' },
};

export default function AgenciesPage() {
  return <LandingPage initialSection="agencies" />;
}

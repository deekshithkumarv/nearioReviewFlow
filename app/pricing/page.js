import LandingPage from '../components/LandingPage';

export const metadata = {
  title: 'Pricing',
  description: '₹599 a month, or ₹5,391 for a year with the first 3 months free. No GST added.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return <LandingPage initialSection="pricing" />;
}

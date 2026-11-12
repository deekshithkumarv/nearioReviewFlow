import LandingPage from '../components/LandingPage';

export const metadata = {
  title: 'Features',
  description: 'QR codes and tap stands, rating trends, the Growth Radar, Google review replies and three languages.',
  alternates: { canonical: '/features' },
};

export default function FeaturesPage() {
  return <LandingPage initialSection="features" />;
}

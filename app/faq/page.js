import LandingPage from '../components/LandingPage';

export const metadata = {
  title: 'FAQ',
  description: 'Answers to what owners ask about billing, refunds, languages and the Google review rules.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return <LandingPage initialSection="faq" />;
}

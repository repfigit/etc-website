import { Metadata } from 'next';
import ResourcesPageClient from './ResourcesPageClient';

// Static metadata for resources page
export const metadata: Metadata = {
  title: 'Resources | NH Emerging Technologies Caucus',
  description: 'Explore curated resources on emerging technologies including AI, blockchain, cybersecurity, quantum computing, and more from the New Hampshire Emerging Technologies Caucus.',
  openGraph: {
    title: 'Resources | NH Emerging Technologies Caucus',
    description: 'Explore curated resources on emerging technologies from the New Hampshire Emerging Technologies Caucus.',
    type: 'website',
    url: 'https://emergingtechnh.org/resources',
    siteName: 'NH Emerging Technologies Caucus',
    images: [{
      url: 'https://emergingtechnh.org/img/index.png',
      width: 1200,
      height: 630,
      alt: 'NH Emerging Technologies Caucus',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resources | NH Emerging Technologies Caucus',
    description: 'Explore curated resources on emerging technologies from the New Hampshire Emerging Technologies Caucus.',
    site: '@EmergingTechNH',
    images: ['https://emergingtechnh.org/img/index.png'],
  },
};

export default function ResourcesPage() {
  return <ResourcesPageClient />;
}

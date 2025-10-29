import { Metadata } from 'next';
import EventsPageClient from './EventsPageClient';

// Static metadata for events listing page
export const metadata: Metadata = {
  title: 'All Events | NH Emerging Technologies Caucus',
  description: 'View all upcoming and past events from the New Hampshire Emerging Technologies Caucus. Join us for discussions on AI, blockchain, cybersecurity, and other emerging technologies.',
  openGraph: {
    title: 'All Events | NH Emerging Technologies Caucus',
    description: 'View all upcoming and past events from the New Hampshire Emerging Technologies Caucus.',
    type: 'website',
    url: 'https://emergingtechnh.org/events',
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
    title: 'All Events | NH Emerging Technologies Caucus',
    description: 'View all upcoming and past events from the New Hampshire Emerging Technologies Caucus.',
    site: '@EmergingTechNH',
    images: ['https://emergingtechnh.org/img/index.png'],
  },
};

export default function EventsPage() {
  return <EventsPageClient />;
}

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
  },
  twitter: {
    card: 'summary',
    title: 'All Events | NH Emerging Technologies Caucus',
    description: 'View all upcoming and past events from the New Hampshire Emerging Technologies Caucus.',
    site: '@EmergingTechNH',
  },
};

export default function EventsPage() {
  return <EventsPageClient />;
}

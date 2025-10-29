import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';
import connectDB from '@/lib/mongodb';
import Event, { IEvent } from '@/lib/models/Event';

interface Props {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for Open Graph and Twitter cards
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    await connectDB();
    const event = await Event.findById(id).lean() as (IEvent & { _id: any }) | null;

    if (!event || !event.isVisible) {
      return {
        title: 'Event Not Found | NH Emerging Technologies Caucus',
        description: 'The requested event could not be found.',
      };
    }

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const title = `${event.topic} | NH Emerging Technologies Caucus`;
    const description = event.content 
      ? event.content.substring(0, 200).replace(/[#*_\[\]]/g, '') + '...'
      : `Join us on ${formatDate(event.date.toISOString())} at ${event.time} for ${event.topic}${event.presenter ? ` with ${event.presenter}` : ''}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://emergingtechnh.org/events/${id}`,
        siteName: 'NH Emerging Technologies Caucus',
      },
      twitter: {
        card: 'summary',
        title,
        description,
        site: '@EmergingTechNH',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Event | NH Emerging Technologies Caucus',
      description: 'View event details from the NH Emerging Technologies Caucus.',
    };
  }
}

// Server component - fetch event data
export default async function EventDetailPage({ params }: Props) {
  try {
    const { id } = await params;
    await connectDB();
    const event = await Event.findById(id).lean() as (IEvent & { _id: any }) | null;

    if (!event || !event.isVisible) {
      notFound();
    }

    // Convert MongoDB document to plain object with serializable data
    const serializedEvent = {
      _id: event._id.toString(),
      date: event.date.toISOString(),
      time: event.time,
      presenter: event.presenter,
      presenterUrl: event.presenterUrl,
      topic: event.topic,
      location: event.location,
      locationUrl: event.locationUrl,
      content: event.content,
      isVisible: event.isVisible,
      presentations: event.presentations?.map((p: any) => ({
        filename: p.filename,
        contentType: p.contentType,
        size: p.size,
        uploadedAt: p.uploadedAt?.toISOString(),
      })) || [],
    };

    return <EventDetailClient event={serializedEvent} />;
  } catch (error) {
    console.error('Error fetching event:', error);
    notFound();
  }
}

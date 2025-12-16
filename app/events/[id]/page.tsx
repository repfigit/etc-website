import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';
import connectDB from '@/lib/mongodb';
import Event, { IEvent } from '@/lib/models/Event';
import { formatTime12Hour } from '@/lib/time-utils';

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
      : `Join us on ${formatDate(event.date.toISOString())} at ${formatTime12Hour(event.time)} for ${event.topic}${event.presenter ? ` with ${event.presenter}` : ''}.`;

    // Use the first event image if available, otherwise fall back to default
    const hasEventImage = event.images && event.images.length > 0;
    const imageUrl = hasEventImage
      ? `https://emergingtechnh.org/api/events/${id}/images/0`
      : 'https://emergingtechnh.org/img/index.png';
    const imageAlt = hasEventImage
      ? `${event.topic} - NH Emerging Technologies Caucus`
      : 'NH Emerging Technologies Caucus';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://emergingtechnh.org/events/${id}`,
        siteName: 'NH Emerging Technologies Caucus',
        images: [{
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        site: '@EmergingTechNH',
        images: [imageUrl],
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
      images: event.images?.map((img: any) => ({
        filename: img.filename,
        contentType: img.contentType,
        size: img.size,
        uploadedAt: img.uploadedAt?.toISOString(),
        order: img.order,
      })) || [],
    };

    return <EventDetailClient event={serializedEvent} />;
  } catch (error) {
    console.error('Error fetching event:', error);
    notFound();
  }
}

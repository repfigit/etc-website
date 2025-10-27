'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Event {
  _id: string;
  date: string;
  time: string;
  presenter?: string;
  presenterUrl?: string;
  topic: string;
  location: string;
  locationUrl?: string;
  presentation?: {
    filename: string;
    data: Buffer;
    contentType: string;
    size: number;
  };
}

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events?limit=5');
        const data = await response.json();
        if (data.success) {
          setEvents(data.data);
          setTotalCount(data.total || data.data.length);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section id="events">
      <div className="image-container">
        <Image src="/img/events.webp" alt="Technology Events" width={400} height={400} />
      </div>
      <div className="content-container">
        <h2>Events</h2>
        <p>
          Join us at our upcoming meetings and seminars where policymakers, industry leaders, and academics
          discuss the future of technology.
        </p>
        {events.length > 0 ? (
          <>
            <ul>
              {events.map((event) => (
                <li key={event._id}>
                  <Link href={`/events/${event._id}`} style={{ color: '#00ffcc', textDecoration: 'none' }}>
                    <strong style={{ textDecoration: 'underline' }}>{event.topic}</strong>
                  </Link>
                  <br />
                  {formatDate(event.date)} at {event.time}
                  {event.presenter && (
                    <>
                      <br />
                      Presenter: {event.presenterUrl ? (
                        <a href={event.presenterUrl} target="_blank" rel="noopener noreferrer">{event.presenter}</a>
                      ) : (
                        event.presenter
                      )}
                    </>
                  )}
                  <br />
                  Location: {event.locationUrl ? (
                    <a href={event.locationUrl} target="_blank" rel="noopener noreferrer">{event.location}</a>
                  ) : (
                    event.location
                  )}
                  {event.presentation && (
                    <>
                      <br />
                      <span style={{ color: '#00ffcc', fontSize: '0.9em' }}>
                        📄 {event.presentation.filename} available
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {totalCount > 5 && (
              <p style={{ marginTop: '1em', fontSize: '1.1em' }}>
                <Link href="/events" style={{ fontWeight: 'bold' }}>
                  → View all {totalCount} events
                </Link>
              </p>
            )}
          </>
        ) : (
          <p>No upcoming events at this time. Check back soon!</p>
        )}
      </div>
    </section>
  );
}


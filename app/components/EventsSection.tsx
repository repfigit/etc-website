'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Event {
  _id: string;
  date: string;
  time: string;
  presenter?: string;
  presenterUrl?: string;
  topic: string;
  location: string;
  locationUrl?: string;
}

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        if (data.success) {
          setEvents(data.data);
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
          <ul>
            {events.map((event) => (
              <li key={event._id}>
                <strong>{formatDate(event.date)} at {event.time}</strong>
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
                Topic: {event.topic}
                <br />
                Location: {event.locationUrl ? (
                  <a href={event.locationUrl} target="_blank" rel="noopener noreferrer">{event.location}</a>
                ) : (
                  event.location
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming events at this time. Check back soon!</p>
        )}
      </div>
    </section>
  );
}


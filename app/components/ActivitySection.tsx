'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import EventDateTime from './EventDateTime';

interface EventItem {
  _id: string;
  date: string;
  time: string;
  topic: string;
  location: string;
}

interface ResourceItem {
  _id: string;
  title: string;
  url: string;
  description?: string;
}

export default function ActivitySection() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const [eventsResponse, resourcesResponse] = await Promise.all([
          fetch('/api/events?limit=3'),
          fetch('/api/resources?featured=true'),
        ]);

        const [eventsData, resourcesData] = await Promise.all([
          eventsResponse.json(),
          resourcesResponse.json(),
        ]);

        if (eventsData.success) {
          setEvents(eventsData.data.slice(0, 2));
        }

        if (resourcesData.success) {
          setResources(resourcesData.data.slice(0, 2));
        }
      } catch (error) {
        console.error('Error fetching homepage activity:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivity();
  }, []);

  const activityEvent = useMemo(() => {
    const now = new Date();
    const upcomingEvents = events
      .filter((event) => new Date(event.date).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      event: upcomingEvents[0] || events[0],
      label: upcomingEvents[0] ? 'Next Event' : 'Recent Event',
    };
  }, [events]);

  const featuredResource = resources[0];
  const event = activityEvent.event;


  return (
    <section className="activity-section" aria-labelledby="activity-heading">
      <div className="activity-heading-group">
        <p className="section-kicker">Current Work</p>
        <h2 id="activity-heading">Briefings, resources, and policy conversations</h2>
      </div>

      {isLoading ? (
        <div className="activity-grid">
          <div className="activity-card activity-card-loading"></div>
          <div className="activity-card activity-card-loading"></div>
        </div>
      ) : (
        <div className="activity-grid">
          <Link href={event ? `/events/${event._id}` : '/events'} className="activity-card activity-card-featured">
            <span className="activity-label">{event ? activityEvent.label : 'Events'}</span>
            <strong>{event ? event.topic : 'No upcoming events posted'}</strong>
            {event ? (
              <span className="activity-meta">
                <EventDateTime date={event.date} time={event.time} variant="short" /> | {event.location}
              </span>
            ) : (
              <span className="activity-meta">Check back for future briefings and meetings.</span>
            )}
          </Link>

          <a
            href={featuredResource?.url || '/resources'}
            target={featuredResource ? '_blank' : undefined}
            rel={featuredResource ? 'noopener noreferrer' : undefined}
            className="activity-card"
          >
            <span className="activity-label">Featured Resource</span>
            <strong>{featuredResource ? featuredResource.title : 'Resource library'}</strong>
            <span className="activity-meta">
              {featuredResource?.description || 'Research, white papers, and legislative updates on emerging technologies.'}
            </span>
          </a>
        </div>
      )}
    </section>
  );
}

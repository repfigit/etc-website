'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatTimeWithTimezone } from '@/lib/time-utils';

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
  images?: {
    filename: string;
    contentType: string;
    size: number;
    order?: number;
  }[];
}

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/events?limit=5');
        const data = await response.json();
        if (data.success) {
          setEvents(data.data);
          setTotalCount(data.total || data.data.length);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
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

  const formatTime = (timeString: string) => {
    // Try to parse and format time nicely
    try {
      const [hours, minutes] = timeString.split(':');
      
      // Validate that both hours and minutes exist after splitting (checking for empty strings too)
      if (!hours || !minutes) {
        return timeString;
      }
      
      const hour = parseInt(hours);
      
      // Validate that hour is a valid number
      if (isNaN(hour)) {
        return timeString;
      }
      
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const getDateBadge = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Past', className: 'date-badge past' };
    } else if (diffDays === 0) {
      return { text: 'Today', className: 'date-badge today' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', className: 'date-badge upcoming' };
    } else if (diffDays <= 7) {
      return { text: 'This Week', className: 'date-badge upcoming' };
    } else {
      return { text: 'Upcoming', className: 'date-badge upcoming' };
    }
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
        {isLoading ? (
          <div className="events-loading">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="events-list-container">
              {events.map((event) => {
                const badge = getDateBadge(event.date);
                return (
                  <Link key={event._id} href={`/events/${event._id}`} className="event-card-home event-card-link">
                    <div className="event-card-header">
                      <div className='event-name-link'>
                        <strong>{event.topic}</strong>
                      </div>
                      <div className="event-card-badges">
                        <span className={badge.className}>{badge.text}</span>
                      </div>
                    </div>
                    <div className="event-card-details">
                      <div className="event-detail-item">
                        <span className="event-detail-icon"></span>
                        <span>{formatDate(event.date)} at {formatTimeWithTimezone(event.date, event.time)}</span>
                        {' '}
                        <button
                          type="button"
                          className="event-calendar-icon"
                          title="Add to calendar"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = `/api/events/${event._id}/ical`;
                            link.download = '';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          📅
                        </button>
                      </div>
                      {event.presenter && (
                        <div className="event-detail-item">
                          <span className="event-detail-icon">👤</span>
                          <span>
                            Presenter: {event.presenterUrl ? (
                              <button
                                type="button"
                                className="event-presenter-link"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.open(event.presenterUrl, '_blank', 'noopener,noreferrer');
                                }}
                              >
                                {event.presenter}
                              </button>
                            ) : (
                              event.presenter
                            )}
                          </span>
                        </div>
                      )}
                      <div className="event-detail-item">
                        <span className="event-detail-icon">📍</span>
                        <span>
                          {event.locationUrl ? (
                            <button
                              type="button"
                              className="event-location-link"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(event.locationUrl, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              {event.location}
                            </button>
                          ) : (
                            event.location
                          )}
                        </span>
                      </div>
                      {event.presentation && (
                        <div className="event-detail-item">
                          <span className="event-detail-icon">📄</span>
                          <span className="events-section-presentation-link">
                            {event.presentation.filename} available
                          </span>
                        </div>
                      )}
                    </div>
                    {event.images && event.images.length > 0 && (
                      <div className="event-thumbnails-home">
                        {event.images.slice(0, 3).map((img, idx) => (
                          <div
                            key={idx}
                            className="event-thumbnail"
                          >
                            <img
                              src={`/api/events/${event._id}/images/${idx}`}
                              alt={img.filename}
                            />
                          </div>
                        ))}
                        {event.images.length > 3 && (
                          <div className="event-thumbnail event-thumbnail-more">
                            +{event.images.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
            {totalCount > 5 && (
              <p className="events-section-view-all">
                <Link href="/events" className="events-section-view-all-link">
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


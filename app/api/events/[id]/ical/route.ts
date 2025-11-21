import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import { logger } from '@/lib/logger';

/**
 * Generate iCalendar (.ics) file for an event
 * GET /api/events/[id]/ical
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Parse the time to extract hours and minutes
    // Expected format: "6:00 PM" or "18:00"
    const timeParts = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    let hours = 0;
    let minutes = 0;
    
    if (timeParts) {
      hours = parseInt(timeParts[1]);
      minutes = parseInt(timeParts[2]);
      const meridiem = timeParts[3]?.toUpperCase();
      
      // Convert to 24-hour format if PM
      if (meridiem === 'PM' && hours < 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
    }
    
    // Create start date/time
    const startDate = new Date(event.date);
    startDate.setHours(hours, minutes, 0, 0);
    
    // Create end date/time (1 hour duration by default)
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);
    
    // Format dates for iCalendar with timezone (YYYYMMDDTHHMMSSZ for UTC)
    // Using America/New_York timezone (Eastern Time)
    const formatICalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      const second = String(date.getSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hour}${minute}${second}`;
    };
    
    // Generate a unique UID for the event
    const uid = `event-${event._id}@emergingtechnh.org`;
    
    // Get current timestamp for DTSTAMP
    const now = formatICalDate(new Date());
    
    // Build description with all event details
    // Preserve line breaks using proper iCalendar escaping
    let description = event.topic;
    if (event.presenter) {
      description += `\n\nPresenter: ${event.presenter}`;
      if (event.presenterUrl) {
        description += ` (${event.presenterUrl})`;
      }
    }
    if (event.content) {
      // Strip markdown but preserve line breaks
      const plainContent = event.content
        .replace(/[#*_~`]/g, '')
        .substring(0, 1000);
      description += `\n\n${plainContent}`;
    }
    
    // Escape special characters for iCalendar format
    // Replace actual newlines with \n for iCalendar spec
    description = description
      .replace(/\\/g, '\\\\')  // Escape backslashes first
      .replace(/;/g, '\\;')      // Escape semicolons
      .replace(/,/g, '\\,')      // Escape commas
      .replace(/\r\n|\n|\r/g, '\\n');  // Convert line breaks to \n
    
    // Build location
    let location = event.location;
    if (event.locationUrl) {
      location += ` - ${event.locationUrl}`;
    }
    
    // Escape the summary (title) as well
    const summary = `[ET Caucus] ${event.topic}`
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r\n|\n|\r/g, '\\n');
    
    // Escape location
    const escapedLocation = location
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r\n|\n|\r/g, '\\n');
    
    // Construct iCalendar file content with timezone
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NH Emerging Technologies Caucus//Event//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE',
      'TZID:America/New_York',
      'BEGIN:STANDARD',
      'DTSTART:19701101T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
      'TZOFFSETFROM:-0400',
      'TZOFFSETTO:-0500',
      'END:STANDARD',
      'BEGIN:DAYLIGHT',
      'DTSTART:19700308T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
      'TZOFFSETFROM:-0500',
      'TZOFFSETTO:-0400',
      'END:DAYLIGHT',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=America/New_York:${formatICalDate(startDate)}`,
      `DTEND;TZID=America/New_York:${formatICalDate(endDate)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${escapedLocation}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Event starts in 1 hour',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    // Return the .ics file
    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="event-${event._id}.ics"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    logger.error('Error generating iCalendar file', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate calendar file' },
      { status: 500 }
    );
  }
}

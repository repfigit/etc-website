/**
 * Maps timezone abbreviations to IANA timezone identifiers
 */
const TIMEZONE_MAP: { [key: string]: string } = {
  'ET': 'America/New_York',
  'EST': 'America/New_York',
  'EDT': 'America/New_York',
  'PT': 'America/Los_Angeles',
  'PST': 'America/Los_Angeles',
  'PDT': 'America/Los_Angeles',
  'CT': 'America/Chicago',
  'CST': 'America/Chicago',
  'CDT': 'America/Chicago',
  'MT': 'America/Denver',
  'MST': 'America/Denver',
  'MDT': 'America/Denver',
};

/**
 * Formats a time string (e.g., "13:00" or "13:00 ET") to 12-hour format (H:MM AM/PM)
 * with timezone conversion to the user's local timezone
 */
export function formatTimeWithTimezone(dateString: string, timeString: string): string {
  try {
    // Parse the date
    const eventDate = new Date(dateString);
    
    // Extract time and timezone (handle formats like "10:00" or "10:00 ET")
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})(?:\s+([A-Z]{2,3}))?/);
    if (!timeMatch) {
      return formatTime12Hour(timeString);
    }
    
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const tzAbbr = timeMatch[3]?.toUpperCase();
    
    // Get IANA timezone if we have an abbreviation
    const eventTimezone = tzAbbr && TIMEZONE_MAP[tzAbbr] ? TIMEZONE_MAP[tzAbbr] : undefined;
    
    if (eventTimezone) {
      // Create date components in the event's timezone
      const year = eventDate.getFullYear();
      const month = eventDate.getMonth();
      const day = eventDate.getDate();
      
      // Create a date string that represents the datetime in the event timezone
      // We'll use Intl to format it, then parse it back
      const dateTimeStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
      
      // Create a formatter for the event timezone to get the UTC equivalent
      // We'll create a date assuming it's in UTC, then adjust
      const utcDate = new Date(dateTimeStr + 'Z');
      
      // Get the time in the event timezone as a string, then parse it
      // This is a workaround - we create the date in UTC, then format it in the event timezone
      // to see what the local representation would be
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: eventTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      // Format the UTC date in the event timezone to see the offset
      const parts = formatter.formatToParts(utcDate);
      const tzYear = parseInt(parts.find(p => p.type === 'year')?.value || '0');
      const tzMonth = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
      const tzDay = parseInt(parts.find(p => p.type === 'day')?.value || '0');
      const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
      const tzMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
      
      // Calculate the offset
      const eventTzDate = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute));
      const offset = utcDate.getTime() - eventTzDate.getTime();
      
      // Create the correct datetime
      const correctDate = new Date(utcDate.getTime() + offset);
      
      // Now format in user's local timezone
      return correctDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      // No timezone specified, assume the time is in the same timezone as the date
      const dt = new Date(eventDate);
      dt.setHours(hours, minutes, 0, 0);
      
      return dt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    return formatTime12Hour(timeString);
  }
}

/**
 * Formats a time string to 12-hour format without timezone conversion
 * (for cases where we just want to display the stored time as-is)
 */
export function formatTime12Hour(timeString: string): string {
  try {
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) {
      return timeString;
    }
    
    const hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
  } catch (error) {
    return timeString;
  }
}


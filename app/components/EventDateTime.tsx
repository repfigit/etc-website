'use client';

import { useEffect, useState } from 'react';
import { formatTimeWithTimezone, formatTime12Hour } from '@/lib/time-utils';

type DateVariant = 'full' | 'long' | 'short';

const DATE_OPTIONS: Record<DateVariant, Intl.DateTimeFormatOptions> = {
  full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  short: { year: 'numeric', month: 'short', day: 'numeric' },
};

interface Props {
  /** ISO date string. Event dates are stored at noon UTC so the calendar day is stable across US timezones. */
  date: string;
  /** Stored time string, e.g. "10:00 ET". */
  time: string;
  /** Date format style. Defaults to "full" (with weekday). */
  variant?: DateVariant;
}

/**
 * Renders "<date> at <time>" for an event.
 *
 * The time is shown in the viewer's local timezone, which is inherently
 * non-deterministic between the server (UTC) and the client. To avoid a React
 * hydration mismatch, the server and the first client render both show the
 * event's stated time (deterministic); after mount we swap to the viewer's
 * local time. The date is always formatted in UTC so it stays deterministic.
 */
export default function EventDateTime({ date, time, variant = 'full' }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dateStr = new Date(date).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    ...DATE_OPTIONS[variant],
  });

  const timeStr = mounted ? formatTimeWithTimezone(date, time) : formatTime12Hour(time);

  return <>{dateStr} at {timeStr}</>;
}

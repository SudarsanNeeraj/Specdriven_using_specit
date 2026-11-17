import { Appointment } from '../types';

function formatUtcForIcs(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function downloadIcsFile(apt: Appointment): void {
  const startUtc = formatUtcForIcs(apt.startTime);
  const endUtc = formatUtcForIcs(apt.endTime);
  const summary = `Doctor Consultation: ${apt.doctorName} (${apt.specialization})`;
  const description = `Consultation with ${apt.doctorName}\\nBooking Ref: ${apt.bookingReference}\\nMode: ${apt.consultationType}\\nClinic: ${apt.clinicName}`;
  const location = apt.consultationType === 'VIDEO' ? 'Online Video Consultation' : `${apt.clinicName}, ${apt.clinicAddress || ''}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Doctor Appointment Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:apt-${apt.bookingReference}@docbooking.com`,
    `DTSTAMP:${formatUtcForIcs(new Date().toISOString())}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `appointment-${apt.bookingReference}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getGoogleCalendarUrl(apt: Appointment): string {
  const startUtc = formatUtcForIcs(apt.startTime);
  const endUtc = formatUtcForIcs(apt.endTime);
  const title = `Doctor Appointment: ${apt.doctorName} (${apt.specialization})`;
  const details = `Medical consultation with ${apt.doctorName}.\nBooking Reference: ${apt.bookingReference}\nMode: ${apt.consultationType}`;
  const location = apt.consultationType === 'VIDEO' ? 'Online Video Consultation' : `${apt.clinicName}`;

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('dates', `${startUtc}/${endUtc}`);
  url.searchParams.set('details', details);
  url.searchParams.set('location', location);

  return url.toString();
}

export function getOutlookCalendarUrl(apt: Appointment): string {
  const title = `Doctor Appointment: ${apt.doctorName} (${apt.specialization})`;
  const details = `Medical consultation with ${apt.doctorName}.\nBooking Reference: ${apt.bookingReference}\nMode: ${apt.consultationType}`;
  const location = apt.consultationType === 'VIDEO' ? 'Online Video Consultation' : `${apt.clinicName}`;

  const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
  url.searchParams.set('subject', title);
  url.searchParams.set('startdt', apt.startTime);
  url.searchParams.set('enddt', apt.endTime);
  url.searchParams.set('body', details);
  url.searchParams.set('location', location);

  return url.toString();
}


export const getTodayDateString = (now = new Date()) => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const parseTripTime = (tripTime: string) => {
  const normalizedTime = tripTime.replace(/\s+/g, ' ').trim();
  const timeMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);

  if (!timeMatch) {
    return { hours: 0, minutes: 0 };
  }

  const [, rawHoursText, rawMinutesText, meridiemRaw] = timeMatch;
  const rawHours = Number.parseInt(rawHoursText, 10);
  const rawMinutes = Number.parseInt(rawMinutesText, 10);
  const meridiem = meridiemRaw?.toUpperCase();

  let hours = Number.isFinite(rawHours) ? rawHours : 0;
  const minutes = Number.isFinite(rawMinutes) ? rawMinutes : 0;

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }

  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
};

export const buildTripStartDateTime = (tripDate: string, tripTime: string) => {
  const tripStart = new Date(`${tripDate}T00:00:00`);
  const { hours, minutes } = parseTripTime(tripTime);

  tripStart.setHours(hours, minutes, 0, 0);
  return tripStart;
};

export const isTripInFuture = (tripDate: string, tripTime: string, now = new Date()) =>
  buildTripStartDateTime(tripDate, tripTime).getTime() > now.getTime();

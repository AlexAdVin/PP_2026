const BOOKING_MINUTE_STEP = 5;

export function getRoundedCurrentBookingStart(now = new Date()) {
  const next = new Date(now);
  next.setSeconds(0, 0);

  const remainder = next.getMinutes() % BOOKING_MINUTE_STEP;

  if (remainder !== 0) {
    next.setMinutes(next.getMinutes() + (BOOKING_MINUTE_STEP - remainder));
  }

  return next;
}

export function getEffectiveBookingStart(bookingTime?: {
  startTime?: string;
  hasUserSelectedStartTime?: boolean;
}) {
  if (bookingTime?.hasUserSelectedStartTime && bookingTime?.startTime) {
    return new Date(bookingTime.startTime);
  }

  return getRoundedCurrentBookingStart();
}
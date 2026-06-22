export const SURGE_MULTIPLIER = 1.05;
export const SERVICE_FEE_RATE = 0.07;
export const DEFAULT_CURRENCY_CODE = "DKK";

export function getDurationMinutes(durationValue: string | Date) {
  const duration = durationValue instanceof Date ? durationValue : new Date(durationValue);
  return Math.max(1, duration.getHours() * 60 + duration.getMinutes());
}

export function getBookingEnd(startValue: string | Date, durationValue: string | Date) {
  const start = startValue instanceof Date ? new Date(startValue) : new Date(startValue);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + getDurationMinutes(durationValue));
  return end;
}

export function calculateBookingPricing(hourlyRate: number, durationValue: string | Date) {
  const durationMinutes = getDurationMinutes(durationValue);
  const parkingAmount = Number(
    (hourlyRate * (durationMinutes / 60) * SURGE_MULTIPLIER).toFixed(2),
  );
  const serviceFeeAmount = Number((parkingAmount * SERVICE_FEE_RATE).toFixed(2));
  const totalAmount = Number((parkingAmount + serviceFeeAmount).toFixed(2));

  return {
    durationMinutes,
    parkingAmount,
    serviceFeeAmount,
    totalAmount,
  };
}
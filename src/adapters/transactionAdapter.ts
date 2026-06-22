import { supabase } from "@/src/lib/supabase";
import {
  DEFAULT_CURRENCY_CODE,
  SERVICE_FEE_RATE,
  SURGE_MULTIPLIER,
} from "@/src/lib/bookingPricing";
import type { PaymentMethodSelection } from "@/src/types/payment";

export type LotBookingWindow = {
  transactionId: string;
  lotId: string;
  startBooking: string;
  endBooking: string;
  status: string;
};

export type BookingTransactionRecord = {
  id: string;
  bookingReference: string;
  lotId: string;
  locationId: string;
  hostId: string;
  driverId: string;
  driverName: string;
  status: string;
  bookedAt: string;
  startBooking: string;
  endBooking: string;
  durationMinutes: number;
  currencyCode: string;
  hourlyRate: number;
  surgeMultiplier: number;
  parkingAmount: number;
  serviceFeeAmount: number;
  totalAmount: number;
  paymentMethodType: string;
  paymentMethodLabel: string;
  paymentProvider: string;
  paymentCapturedAt: string;
};

type CreateBookingTransactionInput = {
  lotId: string;
  startBooking: string;
  endBooking: string;
  hourlyRate: number;
  paymentMethod: PaymentMethodSelection;
};

function mapBookingWindow(row: Record<string, unknown>): LotBookingWindow {
  return {
    transactionId: String(row.transaction_id),
    lotId: String(row.lot_id),
    startBooking: String(row.start_booking),
    endBooking: String(row.end_booking),
    status: String(row.status ?? "confirmed"),
  };
}

function mapTransactionRecord(row: Record<string, unknown>): BookingTransactionRecord {
  return {
    id: String(row.id),
    bookingReference: String(row.booking_reference),
    lotId: String(row.lot_id),
    locationId: String(row.location_id),
    hostId: String(row.host_id),
    driverId: String(row.driver_id),
    driverName: String(row.driver_name),
    status: String(row.status),
    bookedAt: String(row.booked_at),
    startBooking: String(row.start_booking),
    endBooking: String(row.end_booking),
    durationMinutes: Number(row.duration_minutes ?? 0),
    currencyCode: String(row.currency_code ?? DEFAULT_CURRENCY_CODE),
    hourlyRate: Number(row.hourly_rate ?? 0),
    surgeMultiplier: Number(row.surge_multiplier ?? SURGE_MULTIPLIER),
    parkingAmount: Number(row.parking_amount ?? 0),
    serviceFeeAmount: Number(row.service_fee_amount ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    paymentMethodType: String(row.payment_method_type ?? "card"),
    paymentMethodLabel: String(row.payment_method_label ?? "Card"),
    paymentProvider: String(row.payment_provider ?? "manual"),
    paymentCapturedAt: String(row.payment_captured_at ?? row.booked_at),
  };
}

function normalizePaymentMethod(selection: PaymentMethodSelection) {
  return {
    method_type: selection.methodType,
    label: selection.label,
    provider: selection.provider,
    wallet_provider: selection.walletProvider,
    card_brand: selection.cardBrand,
    card_last4: selection.cardLast4,
    card_exp_month: selection.cardExpMonth,
    card_exp_year: selection.cardExpYear,
    cardholder_name: selection.cardholderName,
    mobilepay_phone_last4: selection.mobilepayPhoneLast4,
    mobilepay_profile_name: selection.mobilepayProfileName,
    provider_customer_id: selection.providerCustomerId ?? null,
    provider_payment_method_id: selection.providerPaymentMethodId ?? null,
    billing_country: selection.billingCountry ?? null,
    fingerprint: selection.fingerprint ?? null,
    metadata: selection.metadata ?? {},
  };
}

export async function fetchLotBookingWindows(
  lotId: string,
  windowStart?: string,
  windowEnd?: string,
) {
  const { data, error } = await supabase.rpc("get_lot_booking_windows", {
    input_lot_id: lotId,
    input_window_start: windowStart ?? null,
    input_window_end: windowEnd ?? null,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: Record<string, unknown>) => mapBookingWindow(row));
}

export function findNextAvailableStart(
  windows: LotBookingWindow[],
  requestedStart: Date,
  requestedEnd: Date,
) {
  const sortedWindows = [...windows].sort(
    (left, right) => new Date(left.startBooking).getTime() - new Date(right.startBooking).getTime(),
  );

  let foundBlockingWindow = false;
  let nextAvailableAt = requestedEnd.getTime();

  for (const window of sortedWindows) {
    const windowStart = new Date(window.startBooking).getTime();
    const windowEnd = new Date(window.endBooking).getTime();

    if (windowEnd <= requestedStart.getTime()) {
      continue;
    }

    if (!foundBlockingWindow) {
      if (windowStart < requestedEnd.getTime() && windowEnd > requestedStart.getTime()) {
        foundBlockingWindow = true;
        nextAvailableAt = Math.max(nextAvailableAt, windowEnd);
        continue;
      }

      if (windowStart >= requestedEnd.getTime()) {
        break;
      }
    }

    if (foundBlockingWindow) {
      if (windowStart <= nextAvailableAt) {
        nextAvailableAt = Math.max(nextAvailableAt, windowEnd);
      } else {
        break;
      }
    }
  }

  return foundBlockingWindow ? new Date(nextAvailableAt) : null;
}

export async function createBookingTransaction(input: CreateBookingTransactionInput) {
  const { data, error } = await supabase.rpc("create_booking_transaction", {
    input_payload: {
      lot_id: input.lotId,
      start_booking: input.startBooking,
      end_booking: input.endBooking,
      currency_code: DEFAULT_CURRENCY_CODE,
      service_fee_rate: SERVICE_FEE_RATE,
      surge_multiplier: SURGE_MULTIPLIER,
      hourly_rate: input.hourlyRate,
      payment_method: normalizePaymentMethod(input.paymentMethod),
      metadata: {
        booked_from: "driver_pay_screen",
      },
    },
  });

  if (error) {
    throw error;
  }

  return mapTransactionRecord((data ?? {}) as Record<string, unknown>);
}

export const transactionAdapter = {
  createBookingTransaction,
  fetchLotBookingWindows,
  findNextAvailableStart,
};
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";

type ListingDataInput = {
  type?: string | null;
  addrLoc?: string | null;
  lat?: number | null;
  lng?: number | null;
  nrOfLots?: number | string | null;
  hrPrice?: number | string | null;
  locName?: string | null;
  description?: string | null;
  dyPrice?: boolean | null;
  img?: string | null;
  rating?: number | null;
  isActive?: boolean | null;
  parkingFee?: number | string | null;
};

type LotDraftInput = {
  id?: string | null;
  img?: string | null;
  rules?: string | null;
  lotNr?: number | string | null;
  avlBool?: boolean | null;
  avlDates?: {
    startAvl?: string | Date | null;
    endAvl?: string | Date | null;
  }[] | null;
  avlDaysNTime?: {
    day?: string | null;
    bool?: boolean | null;
    sT?: string | Date | null;
    eT?: string | Date | null;
  }[] | null;
  chargerBool?: boolean | null;
  charger?: {
    chargerNr?: number | string | null;
    plugType?: string | null;
    power?: number | string | null;
    usageFee?: number | string | null;
    pricekWh?: number | string | null;
  }[] | null;
  Transactions?: {
    items?: Record<string, unknown>[] | null;
  } | null;
  parkingFee?: number | string | null;
};

type HostRow = {
  id: string;
  host_sub: string;
  display_name: string;
};

type AvailabilityRow = {
  id: string;
  day: string | null;
  bool: boolean | null;
  s_t: string | null;
  e_t: string | null;
};

type ChargerRow = {
  id: string;
  charger_nr: number | null;
  plug_type: string | null;
  power: number | null;
  usage_fee: number | null;
  price_kwh: number | null;
};

type TransactionRow = {
  id: string;
  lot_id: string;
  driver_id: string;
  driver_name: string;
  start_booking: string;
  end_booking: string;
  agreed_price_hr: number;
  surge: number | null;
};

type LotRow = {
  id: string;
  img: string | null;
  rules: string | null;
  lot_nr: number | null;
  avl_bool: boolean | null;
  start_avl: string | null;
  end_avl: string | null;
  charger_bool: boolean | null;
  parking_fee: number | null;
  location_id?: string;
  lot_availability_windows?: AvailabilityRow[] | null;
  chargers?: ChargerRow[] | null;
  transactions?: TransactionRow[] | null;
};

type LocationRow = {
  id: string;
  host_id: string;
  type: string | null;
  addr_loc: string | null;
  nr_of_lots: number | null;
  hr_price: number | null;
  loc_name: string | null;
  lng: number | null;
  lat: number | null;
  description: string | null;
  dy_price: boolean | null;
  img: string | null;
  rating: number | null;
  is_active: boolean | null;
  review_status: string | null;
  publication_status: string | null;
  published_at: string | null;
  parking_fee: number | null;
  lots?: LotRow[] | null;
};

const LOCATION_SELECT = `
  id,
  host_id,
  type,
  addr_loc,
  nr_of_lots,
  hr_price,
  loc_name,
  lng,
  lat,
  description,
  dy_price,
  img,
  rating,
  is_active,
  review_status,
  publication_status,
  published_at,
  parking_fee,
  lots (
    id,
    img,
    rules,
    lot_nr,
    avl_bool,
    start_avl,
    end_avl,
    charger_bool,
    parking_fee,
    location_id,
    lot_availability_windows (
      id,
      day,
      bool,
      s_t,
      e_t
    ),
    chargers (
      id,
      charger_nr,
      plug_type,
      power,
      usage_fee,
      price_kwh
    ),
    transactions (
      id,
      lot_id,
      driver_id,
      driver_name,
      start_booking,
      end_booking,
      agreed_price_hr,
      surge
    )
  )
`;

function coerceNumber(value: number | string | null | undefined, fallback = 0) {
  if (value == null || value === "") {
    return fallback;
  }

  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
}

function asDate(value: string | Date | null | undefined, fallback: Date) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const nextDate = new Date(value);

    if (!Number.isNaN(nextDate.getTime())) {
      return nextDate;
    }
  }

  return fallback;
}

function toAwsDate(value: string | Date | null | undefined, fallback: Date) {
  return asDate(value, fallback).toISOString().slice(0, 10);
}

function toIsoString(value: string | Date | null | undefined, fallback: Date) {
  return asDate(value, fallback).toISOString();
}

function trimOrNull(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

async function getCurrentUserOrNull() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user ?? null;
}

async function requireCurrentUser() {
  const user = await getCurrentUserOrNull();

  if (!user) {
    throw new Error("An authenticated user is required.");
  }

  return user;
}

function buildFallbackDisplayName(user: User) {
  const metadata = user.user_metadata ?? {};

  return (
    metadata.display_name ??
    metadata.full_name ??
    metadata.name ??
    metadata.given_name ??
    user.email ??
    user.phone ??
    "Driver"
  );
}

async function resolveUserDisplayName(user: User) {
  const { data, error } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.display_name?.trim() || buildFallbackDisplayName(user);
}

function mapAvailabilityRow(row: AvailabilityRow) {
  return {
    id: row.id,
    day: row.day,
    bool: row.bool ?? false,
    sT: row.s_t,
    eT: row.e_t,
  };
}

function mapTransactionRow(row: TransactionRow) {
  return {
    id: row.id,
    lotID: row.lot_id,
    driverID: row.driver_id,
    driverName: row.driver_name,
    startBooking: row.start_booking,
    endBooking: row.end_booking,
    agreedPriceHR: row.agreed_price_hr,
    surge: row.surge,
  };
}

function mapChargerRow(row: ChargerRow) {
  return {
    id: row.id,
    chargerNr: row.charger_nr,
    plugType: row.plug_type,
    power: row.power,
    usageFee: row.usage_fee,
    pricekWh: row.price_kwh,
  };
}

function mapLotRow(row: LotRow) {
  return {
    id: row.id,
    img: row.img,
    rules: row.rules,
    lotNr: row.lot_nr ?? 1,
    avlBool: row.avl_bool ?? true,
    startAvl: row.start_avl,
    endAvl: row.end_avl,
    chargerBool: row.charger_bool ?? false,
    locationID: row.location_id,
    parkingFee: row.parking_fee ?? 0,
    AvlDaysNTimes: {
      items: (row.lot_availability_windows ?? []).map(mapAvailabilityRow),
    },
    Charger: row.chargers?.[0] ? mapChargerRow(row.chargers[0]) : null,
    Transactions: {
      items: (row.transactions ?? []).map(mapTransactionRow),
    },
  };
}

function mapLocationRow(row: LocationRow) {
  return {
    id: row.id,
    hostID: row.host_id,
    type: row.type,
    addrLoc: row.addr_loc,
    nrOfLots: row.nr_of_lots ?? 0,
    hrPrice: row.hr_price ?? 0,
    locName: row.loc_name,
    lng: row.lng,
    lat: row.lat,
    description: row.description,
    dyPrice: row.dy_price ?? false,
    img: row.img,
    rating: row.rating,
    isActive: row.is_active ?? true,
    reviewStatus: row.review_status,
    publicationStatus: row.publication_status,
    publishedAt: row.published_at,
    parkingFee: row.parking_fee ?? row.hr_price ?? 0,
    newPrice: null,
    Lots: {
      items: (row.lots ?? []).map(mapLotRow),
    },
  };
}

function buildLocationPayload(listingData: ListingDataInput, lotDraft: LotDraftInput[]) {
  const now = new Date();
  const listingStartDate = asDate(lotDraft?.[0]?.avlDates?.[0]?.startAvl, now);

  return {
    location: {
      type: trimOrNull(listingData?.type) ?? "Open space",
      addr_loc: trimOrNull(listingData?.addrLoc) ?? "",
      nr_of_lots: Math.max(1, coerceNumber(listingData?.nrOfLots, Math.max(lotDraft.length, 1))),
      hr_price: coerceNumber(listingData?.hrPrice, 0),
      loc_name: trimOrNull(listingData?.locName) ?? "Untitled location",
      lng: listingData?.lng == null ? null : Number(listingData.lng),
      lat: listingData?.lat == null ? null : Number(listingData.lat),
      description:
        trimOrNull(listingData?.description) ??
        "New host listing published from the mobile host flow.",
      dy_price: Boolean(listingData?.dyPrice ?? false),
      img: trimOrNull(listingData?.img),
      rating: listingData?.rating == null ? null : Number(listingData.rating),
      is_active: listingData?.isActive ?? lotDraft.some((lot) => lot?.avlBool !== false),
      parking_fee: coerceNumber(listingData?.parkingFee, listingData?.hrPrice == null ? 0 : Number(listingData.hrPrice)),
    },
    lots: lotDraft.map((lot, index) => {
      const lotStartDate = asDate(lot?.avlDates?.[0]?.startAvl, listingStartDate);
      const lotEndDate = asDate(lot?.avlDates?.[1]?.endAvl, addMonths(lotStartDate, 12));
      const charger = lot?.charger?.[0] ?? null;
      const hasCharger = Boolean(lot?.chargerBool && charger?.plugType);

      return {
        img: trimOrNull(lot?.img),
        rules: trimOrNull(lot?.rules) ?? "Please read the host note before arrival.",
        lot_nr: Math.max(1, coerceNumber(lot?.lotNr, index + 1)),
        avl_bool: lot?.avlBool ?? true,
        start_avl: toAwsDate(lot?.avlDates?.[0]?.startAvl, lotStartDate),
        end_avl: toAwsDate(lot?.avlDates?.[1]?.endAvl, lotEndDate),
        charger_bool: hasCharger,
        parking_fee: coerceNumber(lot?.parkingFee, listingData?.hrPrice == null ? 0 : Number(listingData.hrPrice)),
        availability: (lot?.avlDaysNTime ?? []).map((entry) => ({
          day: trimOrNull(entry?.day),
          bool: entry?.bool ?? false,
          s_t: toIsoString(entry?.sT, lotStartDate),
          e_t: toIsoString(entry?.eT, addMonths(lotStartDate, 12)),
        })),
        charger: hasCharger
          ? {
              charger_nr: Math.max(1, coerceNumber(charger?.chargerNr, index + 1)),
              plug_type: trimOrNull(charger?.plugType),
              power: coerceNumber(charger?.power, 0),
              usage_fee: coerceNumber(charger?.usageFee, 0),
              price_kwh: coerceNumber(charger?.pricekWh, 0),
            }
          : null,
      };
    }),
  };
}

async function fetchLocationById(locationId: string) {
  const { data, error } = await supabase
    .from("locations")
    .select(LOCATION_SELECT)
    .eq("id", locationId)
    .single();

  if (error) {
    throw error;
  }

  return mapLocationRow(data as LocationRow);
}

async function fetchHostLocations(hostId: string) {
  const { data, error } = await supabase
    .from("locations")
    .select(LOCATION_SELECT)
    .eq("host_id", hostId)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapLocationRow(row as LocationRow));
}

export async function createPublishedLocation(listingData: ListingDataInput, lotDraft: LotDraftInput[]) {
  const user = await requireCurrentUser();
  const inputPayload = buildLocationPayload(listingData, lotDraft);

  const { data, error } = await supabase.rpc("create_host_listing", {
    input_payload: inputPayload,
  });

  if (error) {
    throw error;
  }

  const locationId = typeof data === "string" ? data : String(data);
  const location = await fetchLocationById(locationId);

  return {
    locationId,
    location,
    ownerUserId: user.id,
  };
}

export async function fetchCurrentHostLotState() {
  const user = await getCurrentUserOrNull();

  if (!user) {
    return {
      hostSub: null,
      hostName: "",
      locations: [],
    };
  }

  const displayName = await resolveUserDisplayName(user);
  const { data, error } = await supabase
    .from("hosts")
    .select("id, host_sub, display_name")
    .eq("host_sub", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      hostSub: user.id,
      hostName: displayName,
      locations: [],
    };
  }

  const hostRow = data as HostRow;
  const locations = await fetchHostLocations(hostRow.id);

  return {
    hostSub: hostRow.host_sub,
    hostName: hostRow.display_name,
    locations,
  };
}

export async function fetchPublishedLocations() {
  const { data, error } = await supabase
    .from("locations")
    .select(LOCATION_SELECT)
    .eq("publication_status", "published")
    .eq("is_active", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapLocationRow(row as LocationRow));
}

export const hostLocationAdapter = {
  createPublishedLocation,
  fetchById: fetchLocationById,
  fetchCurrentHostLotState,
  fetchPublishedLocations,
};
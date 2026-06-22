import { supabase } from "@/src/lib/supabase";

type DriverDiscoveryFilters = {
  minHourlyPrice?: number | null;
  maxHourlyPrice?: number | null;
  chargerRequired?: boolean;
  locationTypes?: string[];
};

type MapViewport = {
  northEast?: {
    latitude?: number;
    longitude?: number;
  };
  southWest?: {
    latitude?: number;
    longitude?: number;
  };
};

function normalizeFilters(filters?: DriverDiscoveryFilters | null) {
  return {
    min_hourly_price: filters?.minHourlyPrice ?? null,
    max_hourly_price: filters?.maxHourlyPrice ?? null,
    charger_required: Boolean(filters?.chargerRequired ?? false),
    location_types: Array.isArray(filters?.locationTypes) ? filters.locationTypes.filter(Boolean) : [],
  };
}

function roundBoundaryValue(value: number) {
  return Number(value.toFixed(4));
}

function buildBoundsPayload(viewport?: MapViewport | null) {
  const southWestLat = viewport?.southWest?.latitude;
  const northEastLat = viewport?.northEast?.latitude;
  const southWestLng = viewport?.southWest?.longitude;
  const northEastLng = viewport?.northEast?.longitude;

  if (
    southWestLat == null ||
    northEastLat == null ||
    southWestLng == null ||
    northEastLng == null
  ) {
    return null;
  }

  return {
    southWestLat,
    northEastLat,
    southWestLng,
    northEastLng,
  };
}

async function fetchPublishedInBounds(viewport?: MapViewport | null, filters?: DriverDiscoveryFilters | null) {
  const boundsPayload = buildBoundsPayload(viewport);

  if (!boundsPayload) {
    return [];
  }

  const { data, error } = await supabase.rpc("list_public_locations_in_bounds", {
    input_southwest_lat: boundsPayload.southWestLat,
    input_northeast_lat: boundsPayload.northEastLat,
    input_southwest_lng: boundsPayload.southWestLng,
    input_northeast_lng: boundsPayload.northEastLng,
    input_filters: normalizeFilters(filters),
  });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data : [];
}

async function fetchPublishedById(locationId: string) {
  const { data, error } = await supabase.rpc("get_public_location_by_id", {
    input_location_id: locationId,
  });

  if (error) {
    throw error;
  }

  return data ?? null;
}

export const publicLocationAdapter = {
  buildDiscoveryFetchKey: (activeTab: string, viewport: MapViewport, filters?: DriverDiscoveryFilters | null) => {
    const boundsPayload = buildBoundsPayload(viewport);

    if (!boundsPayload) {
      return JSON.stringify({ activeTab, viewport: null, filters: normalizeFilters(filters) });
    }

    return JSON.stringify({
      activeTab,
      bounds: {
        southWestLat: roundBoundaryValue(boundsPayload.southWestLat),
        northEastLat: roundBoundaryValue(boundsPayload.northEastLat),
        southWestLng: roundBoundaryValue(boundsPayload.southWestLng),
        northEastLng: roundBoundaryValue(boundsPayload.northEastLng),
      },
      filters: normalizeFilters(filters),
    });
  },
  fetchPublished: fetchPublishedInBounds,
  fetchById: fetchPublishedById,
};
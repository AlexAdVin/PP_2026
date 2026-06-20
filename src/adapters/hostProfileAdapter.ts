import type { User } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";

export type AppHostProfile = {
  id: string;
  hostSub: string;
  hostName: string;
  createdAt?: string;
  updatedAt?: string;
};

type HostProfileRow = {
  id: string;
  host_sub: string;
  display_name: string;
  created_at?: string;
  updated_at?: string;
};

function buildFallbackDisplayName(user: User) {
  const metadata = user.user_metadata ?? {};

  return (
    metadata.display_name ??
    metadata.full_name ??
    metadata.name ??
    metadata.given_name ??
    user.email ??
    user.phone ??
    "Host"
  );
}

function mapRow(row: HostProfileRow): AppHostProfile {
  return {
    id: row.id,
    hostSub: row.host_sub,
    hostName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function requireCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("An authenticated user is required.");
  }

  return data.user;
}

async function resolveDisplayName(user: User, preferredDisplayName?: string | null) {
  const trimmedPreferredName = preferredDisplayName?.trim();

  if (trimmedPreferredName) {
    return trimmedPreferredName;
  }

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

export async function upsertCurrentHostProfile(preferredDisplayName?: string | null) {
  const user = await requireCurrentUser();
  const displayName = await resolveDisplayName(user, preferredDisplayName);

  const { data, error } = await supabase.rpc("upsert_host_profile", {
    input_display_name: displayName,
  });

  if (error) {
    throw error;
  }

  return mapRow(data as HostProfileRow);
}

export const hostProfileAdapter = {
  upsertCurrent: upsertCurrentHostProfile,
};
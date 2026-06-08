import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";

export type AppUserProfile = {
  id: string;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  authProvider: string;
  createdAt?: string;
  updatedAt?: string;
};

type UpsertableUserProfile = {
  id: string;
  phone: string | null;
  email: string | null;
  display_name: string | null;
  auth_provider: string;
};

function pickProvider(user: User) {
  const firstIdentity = user.identities?.[0]?.provider;
  return firstIdentity ?? user.app_metadata.provider ?? (user.email ? "email" : "phone");
}

function buildDisplayName(user: User) {
  const metadata = user.user_metadata ?? {};

  return (
    metadata.display_name ??
    metadata.full_name ??
    metadata.name ??
    metadata.given_name ??
    user.phone ??
    user.email ??
    null
  );
}

function mapRow(row: Record<string, unknown>): AppUserProfile {
  return {
    id: String(row.id),
    phone: (row.phone as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    displayName: (row.display_name as string | null) ?? null,
    authProvider: String(row.auth_provider ?? "phone"),
    createdAt: (row.created_at as string | undefined) ?? undefined,
    updatedAt: (row.updated_at as string | undefined) ?? undefined,
  };
}

function buildUpsertPayload(user: User): UpsertableUserProfile {
  return {
    id: user.id,
    phone: user.phone ?? null,
    email: user.email ?? null,
    display_name: buildDisplayName(user),
    auth_provider: pickProvider(user),
  };
}

export async function upsertUserProfileForSession(session: Session) {
  const payload = buildUpsertPayload(session.user);

  const { data, error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "id" })
    .select("id, phone, email, display_name, auth_provider, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return mapRow(data);
}

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, phone, email, display_name, auth_provider, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapRow(data) : null;
}

export const userProfileAdapter = {
  fetchById: fetchUserProfile,
  upsertForSession: upsertUserProfileForSession,
};
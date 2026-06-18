import { supabase } from "@/src/lib/supabase";

export type IdentityKind = "email" | "phone";

export type IdentityLookupResult = {
  identity: string;
  normalizedIdentity: string;
  kind: IdentityKind;
  exists: boolean;
};

type RpcLookupRow = {
  identity_type: IdentityKind;
  exists: boolean;
};

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function normalizePhone(value: string) {
  const trimmed = value.trim();
  const prefix = trimmed.startsWith("+") ? "+" : "";
  const digits = trimmed.replace(/[^\d]/g, "");
  return `${prefix}${digits}`;
}

export function parseIdentity(identity: string) {
  const trimmed = identity.trim();

  if (!trimmed) {
    throw new Error("Enter your email or phone number.");
  }

  if (isEmail(trimmed)) {
    return {
      kind: "email" as const,
      normalizedIdentity: trimmed.toLowerCase(),
    };
  }

  const normalizedPhone = normalizePhone(trimmed);

  if (normalizedPhone.replace(/\D/g, "").length < 8) {
    throw new Error("Enter a valid email address or phone number.");
  }

  return {
    kind: "phone" as const,
    normalizedIdentity: normalizedPhone,
  };
}

export async function lookupAuthIdentity(identity: string): Promise<IdentityLookupResult> {
  const { kind, normalizedIdentity } = parseIdentity(identity);

  const { data, error } = await supabase.rpc("lookup_auth_identity", {
    identity_value: normalizedIdentity,
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? (data[0] as RpcLookupRow | undefined) : undefined;

  return {
    identity,
    normalizedIdentity,
    kind,
    exists: row?.exists ?? false,
  };
}

export const authIdentityAdapter = {
  lookup: lookupAuthIdentity,
  parse: parseIdentity,
};
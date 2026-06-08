import { useEffect } from "react";
import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

import { authSearchGateAdapter } from "@/src/adapters/authSearchGateAdapter";
import {
  userProfileAdapter,
  type AppUserProfile,
} from "@/src/adapters/userProfileAdapter";
import { supabase } from "@/src/lib/supabase";

type PendingSearch = {
  placeId: string;
  description: string;
};

export type AuthModalReason =
  | "search-limit"
  | "profile-required"
  | "payment-required"
  | "host-required";

type AuthState = {
  initialized: boolean;
  session: Session | null;
  profile: AppUserProfile | null;
  modalVisible: boolean;
  modalReason: AuthModalReason | null;
  pendingSearch: PendingSearch | null;
  hostAuthPending: boolean;
  setInitialized: (value: boolean) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: AppUserProfile | null) => void;
  openModal: (reason: AuthModalReason) => void;
  closeModal: () => void;
  setPendingSearch: (payload: PendingSearch) => void;
  clearPendingSearch: () => void;
  setHostAuthPending: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  initialized: false,
  session: null,
  profile: null,
  modalVisible: false,
  modalReason: null,
  pendingSearch: null,
  hostAuthPending: false,
  setInitialized: (value) => set({ initialized: value }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  openModal: (reason) => set({ modalVisible: true, modalReason: reason }),
  closeModal: () => set({ modalVisible: false, modalReason: null }),
  setPendingSearch: (payload) => set({ pendingSearch: payload }),
  clearPendingSearch: () => set({ pendingSearch: null }),
  setHostAuthPending: (value) => set({ hostAuthPending: value }),
}));

async function hydrateSession(session: Session | null) {
  const state = useAuthStore.getState();
  state.setSession(session);

  if (!session) {
    state.setProfile(null);
    return;
  }

  const profile = await userProfileAdapter.upsertForSession(session);
  state.setProfile(profile);
  await authSearchGateAdapter.resetSearchGate();
}

export function useAuthBootstrap() {
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        console.error("Failed to restore auth session", error);
      } else {
        try {
          await hydrateSession(data.session);
        } catch (sessionError) {
          console.error("Failed to hydrate user profile", sessionError);
        }
      }

      if (isMounted) {
        setInitialized(true);
      }
    });

    const subscription = supabase.auth.onAuthStateChange((_, session) => {
      void hydrateSession(session).catch((error) => {
        console.error("Failed to process auth state change", error);
      });
    });

    return () => {
      isMounted = false;
      subscription.data.subscription.unsubscribe();
    };
  }, [setInitialized]);
}
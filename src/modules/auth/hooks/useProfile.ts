"use client";

import { AUTH_PROFILE_URL } from "@/auth/services/auth.service";
import type { Profile } from "@/auth/types/profile";
import { useQueryFetch } from "@/core/hooks/useQueryFetch";

export const PROFILE_QUERY_KEYS = ["users", "me"] as const;

export const useProfile = () => {
  return useQueryFetch<Profile>({
    url: AUTH_PROFILE_URL,
    queryKeys: [...PROFILE_QUERY_KEYS],
  });
};

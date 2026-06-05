import type { LoginFormValues } from "@/auth/types/login.schema";
import type { PasswordFormValues } from "@/auth/types/password.schema";
import type { Profile } from "@/auth/types/profile";
import type { ProfileFormValues } from "@/auth/types/profile.schema";
import { authAxios, globalAxios } from "@/utils/axios";

export const AUTH_LOGIN_URL = "/auth/login";
export const AUTH_PROFILE_URL = "/auth/profile";
export const AUTH_PASSWORD_URL = "/auth/password";

export type LoginResponse = {
  token?: string;
  message?: string;
};

export type ProfileResponse = Profile & {
  message?: string;
};

export type PasswordChangeResponse = {
  message?: string;
};

export const login = async (data: LoginFormValues): Promise<LoginResponse> => {
  const res = await globalAxios.post<LoginResponse>(AUTH_LOGIN_URL, data);
  return res.data;
};

export const getProfile = async (): Promise<Profile> => {
  const res = await authAxios.get<Profile>(AUTH_PROFILE_URL);
  return res.data;
};

export const updateProfile = async (
  data: ProfileFormValues,
): Promise<ProfileResponse> => {
  const res = await authAxios.patch<ProfileResponse>(AUTH_PROFILE_URL, data);
  return res.data;
};

export const changePassword = async (
  data: PasswordFormValues,
): Promise<PasswordChangeResponse> => {
  const res = await authAxios.put<PasswordChangeResponse>(
    AUTH_PASSWORD_URL,
    data,
  );
  return res.data;
};

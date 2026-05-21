import type { LoginFormValues } from "@/auth/types/login.schema";
import { globalAxios } from "@/utils/axios";

export const AUTH_LOGIN_URL = "/auth/login";

export type LoginResponse = {
  token?: string;
  message?: string;
};

export const login = async (data: LoginFormValues): Promise<LoginResponse> => {
  const res = await globalAxios.post<LoginResponse>(AUTH_LOGIN_URL, data);
  return res.data;
};

"use server";

import { cookies } from "next/headers";
import { API_BASE_URL, AUTH_TOKEN_KEY } from "@/constants";

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const executeFetch = async (
  url: `/${string}`,
  init: RequestInit = {},
): Promise<Response> => {
  const cookieStore = await cookies();
  // 1️⃣ Get token from cookie
  const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;

  // 2️⃣ Merge default + custom headers + Authorization
  const finalHeaders: HeadersInit = {
    ...defaultHeaders,
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // 3️⃣ Build final fetch config
  const finalInit: RequestInit = {
    method: init.method || "GET",
    ...init,
    headers: finalHeaders,
  };

  // 4️⃣ Execute request
  const response = await fetch(`${API_BASE_URL}${url}`, finalInit);
  return response;
};

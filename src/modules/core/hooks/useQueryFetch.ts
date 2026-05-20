"use client";

import { useQuery } from "@tanstack/react-query";
// import { toast } from "sonner";
import { authAxios, globalAxios } from "@/utils/axios";

interface QueryFetchProps<_T> {
  url: string;
  queryKeys?: Array<string | number>;
  enabled?: boolean;
  auth?: boolean;
}

/**
 * Generic hook to fetch data using React Query and Axios
 * Supports auth and global axios instances
 */
export function useQueryFetch<T = unknown>({
  url,
  queryKeys,
  enabled = true,
  auth = true,
}: QueryFetchProps<T>) {
  const axiosClient = auth ? authAxios : globalAxios;

  return useQuery<T>({
    queryKey: queryKeys && queryKeys.length > 0 ? queryKeys : [url],
    queryFn: async () => {
      const res = await axiosClient.get(url);
      //   toast.success(res?.data.message);
      return res.data;
    },
    staleTime: 60 * 5 * 1000, // 5 min
    gcTime: 60 * 5 * 1000, // 5 min
    enabled,
    refetchOnWindowFocus: false, // optional default
  });
}

"use client";

import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { authAxios, globalAxios } from "@/utils/axios";

type HttpMethod = "post" | "put" | "patch" | "delete";

export interface DynamicMutationPayload<TBody = unknown> {
  url: string;
  method?: HttpMethod;
  data?: TBody;
  queryKeys?: Array<string>; // dynamic query invalidation
  onSuccess?: (data: unknown) => void; // per-call success callback
  onError?: (error: unknown) => void; // per-call error callback
}

export interface MutationOptions {
  auth?: boolean; // default true
}

export function useMutationQuery<TResponse = unknown>({
  auth = true,
}: MutationOptions = {}): UseMutationResult<
  TResponse,
  unknown,
  DynamicMutationPayload
> {
  const queryClient = useQueryClient();
  const axiosClient = auth ? authAxios : globalAxios;

  const mutationFn = async (
    payload: DynamicMutationPayload,
  ): Promise<TResponse> => {
    const { url, method = "post", data } = payload;

    if (method === "delete") {
      const res = await axiosClient.delete<TResponse>(url, { data });
      return res.data;
    }

    const res = await axiosClient[method]<TResponse>(url, data);
    return res.data;
  };

  return useMutation<TResponse, unknown, DynamicMutationPayload>({
    mutationFn,
    onSuccess: (data, variables) => {
      // invalidate queries dynamically
      if (variables.queryKeys?.length) {
        variables.queryKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
      // call per-mutation onSuccess if provided
      variables.onSuccess?.(data);
    },
    onError: (_error, variables) => {
      // call per-mutation onError if provided
      variables.onError?.(_error);
    },
  });
}

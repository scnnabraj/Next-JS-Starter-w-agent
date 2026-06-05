"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { PROFILE_QUERY_KEYS } from "@/auth/hooks/useProfile";
import { AUTH_PROFILE_URL } from "@/auth/services/auth.service";
import {
  type ProfileFormValues,
  profileSchema,
} from "@/auth/types/profile.schema";
import { useMutationQuery } from "@/core/hooks/useMutationQuery";

type ProfileErrorBody = {
  message?: string;
  errors?: Record<string, Array<string>>;
};

const PROFILE_FIELDS = ["name", "email"] as const;

type UseProfileFormOptions = {
  defaultValues?: Partial<ProfileFormValues>;
};

export const useProfileForm = (options: UseProfileFormOptions = {}) => {
  const mutation = useMutationQuery({ auth: true });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: options.defaultValues?.name ?? "",
      email: options.defaultValues?.email ?? "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      url: AUTH_PROFILE_URL,
      method: "patch",
      data: values,
      queryKeys: [...PROFILE_QUERY_KEYS],
      onSuccess: () => {
        form.reset(values);
      },
      onError: (error) => {
        const axiosError = error as AxiosError<ProfileErrorBody>;
        const fieldErrors = axiosError.response?.data?.errors;

        if (fieldErrors) {
          for (const [field, messages] of Object.entries(fieldErrors)) {
            if (
              PROFILE_FIELDS.includes(field as (typeof PROFILE_FIELDS)[number])
            ) {
              form.setError(field as keyof ProfileFormValues, {
                message: messages[0],
              });
            }
          }
          return;
        }

        form.setError("root", {
          message:
            axiosError.response?.data?.message ??
            "Failed to update profile. Please try again.",
        });
      },
    });
  });

  return {
    form,
    onSubmit,
    isSubmitting: mutation.isPending,
  };
};

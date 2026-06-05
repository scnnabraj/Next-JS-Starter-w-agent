"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";

import { AUTH_PASSWORD_URL } from "@/auth/services/auth.service";
import {
  type PasswordFormValues,
  passwordSchema,
} from "@/auth/types/password.schema";
import { useMutationQuery } from "@/core/hooks/useMutationQuery";

type PasswordErrorBody = {
  message?: string;
  errors?: Record<string, Array<string>>;
};

const PASSWORD_FIELDS = [
  "currentPassword",
  "newPassword",
  "confirmPassword",
] as const;

export const usePasswordForm = () => {
  const mutation = useMutationQuery({ auth: true });

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      url: AUTH_PASSWORD_URL,
      method: "put",
      data: values,
      onSuccess: () => {
        form.reset();
      },
      onError: (error) => {
        const axiosError = error as AxiosError<PasswordErrorBody>;
        const fieldErrors = axiosError.response?.data?.errors;

        if (fieldErrors) {
          for (const [field, messages] of Object.entries(fieldErrors)) {
            if (
              PASSWORD_FIELDS.includes(
                field as (typeof PASSWORD_FIELDS)[number],
              )
            ) {
              form.setError(field as keyof PasswordFormValues, {
                message: messages[0],
              });
            }
          }
          return;
        }

        form.setError("root", {
          message:
            axiosError.response?.data?.message ??
            "Failed to change password. Please try again.",
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

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";

import {
  AUTH_LOGIN_URL,
  type LoginResponse,
} from "@/auth/services/auth.service";
import { type LoginFormValues, loginSchema } from "@/auth/types/login.schema";
import { useMutationQuery } from "@/core/hooks/useMutationQuery";

type LoginErrorBody = {
  message?: string;
  errors?: Record<string, Array<string>>;
};

export const useLoginForm = () => {
  const mutation = useMutationQuery<LoginResponse>({ auth: false });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      url: AUTH_LOGIN_URL,
      method: "post",
      data: values,
      onSuccess: () => {
        form.reset();
      },
      onError: (error) => {
        const axiosError = error as AxiosError<LoginErrorBody>;
        const fieldErrors = axiosError.response?.data?.errors;

        if (fieldErrors) {
          for (const [field, messages] of Object.entries(fieldErrors)) {
            if (field === "email" || field === "password") {
              form.setError(field, { message: messages[0] });
            }
          }
          return;
        }

        form.setError("root", {
          message:
            axiosError.response?.data?.message ??
            "Login failed. Please try again.",
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

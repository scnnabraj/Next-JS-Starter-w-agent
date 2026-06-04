"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { PasswordFormValues } from "@/auth/types/password.schema";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";

type PasswordFormProps = {
  register: UseFormRegister<PasswordFormValues>;
  errors: FieldErrors<PasswordFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
};

const PasswordForm = ({
  register,
  errors,
  onSubmit,
  isSubmitting,
}: PasswordFormProps) => {
  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.currentPassword)}
          {...register("currentPassword")}
        />
        {errors.currentPassword?.message ? (
          <p className="text-sm text-destructive">
            {errors.currentPassword.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.newPassword)}
          {...register("newPassword")}
        />
        {errors.newPassword?.message ? (
          <p className="text-sm text-destructive">
            {errors.newPassword.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword?.message ? (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      {errors.root?.message ? (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
};

export default PasswordForm;

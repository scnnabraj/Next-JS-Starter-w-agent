"use client";

import LoginForm from "@/auth/components/LoginForm";
import { useLoginForm } from "@/auth/hooks/useLoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";

const LoginPage = () => {
  const { form, onSubmit, isSubmitting } = useLoginForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            register={register}
            errors={errors}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </main>
  );
};

export default LoginPage;

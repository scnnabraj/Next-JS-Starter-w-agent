"use client";

import { useEffect } from "react";

import PasswordForm from "@/auth/components/PasswordForm";
import ProfileForm from "@/auth/components/ProfileForm";
import ProfileView from "@/auth/components/ProfileView";
import { usePasswordForm } from "@/auth/hooks/usePasswordForm";
import { useProfile } from "@/auth/hooks/useProfile";
import { useProfileForm } from "@/auth/hooks/useProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";

const UserProfile = () => {
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useProfile();
  const {
    form: profileForm,
    onSubmit: onProfileSubmit,
    isSubmitting: isProfileSubmitting,
  } = useProfileForm({
    defaultValues: profile,
  });
  const {
    form: passwordForm,
    onSubmit: onPasswordSubmit,
    isSubmitting: isPasswordSubmitting,
  } = usePasswordForm();

  const {
    register: registerProfile,
    formState: { errors: profileErrors },
    reset: resetProfileForm,
  } = profileForm;

  useEffect(() => {
    if (profile) {
      resetProfileForm(profile);
    }
  }, [profile, resetProfileForm]);
  const {
    register: registerPassword,
    formState: { errors: passwordErrors },
  } = passwordForm;

  const profileErrorMessage = isProfileError
    ? profileError instanceof Error
      ? profileError.message
      : "Failed to load profile."
    : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>Account details on file.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileView
            profile={profile}
            isLoading={isProfileLoading}
            error={profileErrorMessage}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>Update your name and email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            register={registerProfile}
            errors={profileErrors}
            onSubmit={onProfileSubmit}
            isSubmitting={isProfileSubmitting}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password. You will need your current password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm
            register={registerPassword}
            errors={passwordErrors}
            onSubmit={onPasswordSubmit}
            isSubmitting={isPasswordSubmitting}
          />
        </CardContent>
      </Card>
    </main>
  );
};

export default UserProfile;

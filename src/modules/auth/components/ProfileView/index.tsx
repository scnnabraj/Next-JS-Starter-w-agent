"use client";

import type { Profile } from "@/auth/types/profile";

type ProfileViewProps = {
  profile?: Profile | null;
  isLoading?: boolean;
  error?: string | null;
};

const formatValue = (value: string | undefined) => value?.trim() || "—";

const ProfileView = ({ profile, isLoading, error }: ProfileViewProps) => {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Loading profile…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!profile) {
    return (
      <p className="text-sm text-muted-foreground">
        No profile data available.
      </p>
    );
  }

  return (
    <dl className="grid gap-4">
      <div className="grid gap-1">
        <dt className="text-sm text-muted-foreground">Name</dt>
        <dd className="font-medium text-foreground">
          {formatValue(profile.name)}
        </dd>
      </div>
      <div className="grid gap-1">
        <dt className="text-sm text-muted-foreground">Email</dt>
        <dd className="font-medium text-foreground">
          {formatValue(profile.email)}
        </dd>
      </div>
    </dl>
  );
};

export default ProfileView;

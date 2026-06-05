import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoaderProps = {
  className?: string;
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  /** Full-area centered loader (matches handoff conversation view loading state) */
  fullPage?: boolean;
};

const iconSizeClasses = {
  sm: "size-4",
  md: "size-8",
  lg: "size-10",
} as const;

const Loader = ({
  className,
  label = "Loading",
  showLabel = true,
  size = "md",
  fullPage = false,
}: Readonly<LoaderProps>) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullPage && "min-h-[60vh] w-full",
        className,
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-muted-foreground",
          iconSizeClasses[size],
        )}
        aria-hidden
      />
      {showLabel ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Loader;

import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  name: string;
  image?: string | null;
  size?: "sm" | "lg";
  className?: string;
};

export function ProfileAvatar({ name, image, size = "sm", className }: ProfileAvatarProps) {
  const dim = size === "lg" ? "size-16" : "size-full";
  const iconSize = size === "lg" ? "size-7" : "size-4";

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar GitHub hors remotePatterns
      <img
        src={image}
        alt={name}
        className={cn(dim, "rounded-full object-cover", className)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={cn(
        dim,
        "inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground",
        className,
      )}
      aria-hidden={size === "sm"}
    >
      <User className={iconSize} strokeWidth={1.75} />
    </span>
  );
}

"use client";
import { cn, getInitials, getAvatarBg } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showOnline?: boolean;
}

const sizes = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
  xl: "w-14 h-14 text-lg",
};

export function Avatar({ name, src, size = "md", className, showOnline }: AvatarProps) {
  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white",
        sizes[size],
        !src && getAvatarBg(name)
      )}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
      {showOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full" />
      )}
    </div>
  );
}

"use client";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, icon, iconRight, className, ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-9 bg-background border border-border rounded-lg px-3 text-sm",
            "placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-150",
            icon && "pl-9",
            iconRight && "pr-9",
            error && "border-destructive focus:ring-destructive",
            className
          )}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label, options, className, ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <select
        ref={ref}
        className={cn(
          "h-9 bg-background border border-border rounded-lg px-3 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
          "appearance-none cursor-pointer",
          className
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
});
Select.displayName = "Select";

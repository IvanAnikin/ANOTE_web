"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

/* ---------- shared wrapper ---------- */
interface FieldWrapperProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldWrapper({ label, error, children, className }: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-text-primary">{label}</label>
      )}
      {children}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

/* ---------- base input styles ---------- */
const inputBase =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-text-primary placeholder:text-text-secondary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

/* ---------- Input ---------- */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <FieldWrapper label={label} error={error}>
        <input ref={ref} className={cn(inputBase, error && "border-error", className)} {...props} />
      </FieldWrapper>
    );
  },
);
Input.displayName = "Input";

/* ---------- Textarea ---------- */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <FieldWrapper label={label} error={error}>
        <textarea
          ref={ref}
          className={cn(inputBase, "min-h-[100px] resize-y", error && "border-error", className)}
          {...props}
        />
      </FieldWrapper>
    );
  },
);
Textarea.displayName = "Textarea";

/* ---------- Select ---------- */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <FieldWrapper label={label} error={error}>
        <select
          ref={ref}
          className={cn(inputBase, "appearance-none cursor-pointer", error && "border-error", className)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  },
);
Select.displayName = "Select";

/* ---------- Checkbox ---------- */
interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <label className="flex items-start gap-3 cursor-pointer text-sm text-text-secondary">
          <input
            ref={ref}
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
            {...props}
          />
          <span>{label}</span>
        </label>
        {error && <p className="text-sm text-error ml-7">{error}</p>}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";

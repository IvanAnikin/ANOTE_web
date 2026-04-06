"use client";

import type { VisitType } from "@/hooks/useDemoSession";

const VISIT_TYPE_KEYS: VisitType[] = [
  "default",
  "initial",
  "followup",
  "gastroscopy",
  "colonoscopy",
  "ultrasound",
];

interface VisitTypeSelectorProps {
  value: VisitType;
  onChange: (vt: VisitType) => void;
  label: string;
  options: Record<string, string>;
  disabled?: boolean;
}

export function VisitTypeSelector({
  value,
  onChange,
  label,
  options,
  disabled,
}: VisitTypeSelectorProps) {
  return (
    <div>
      <label
        htmlFor="visit-type"
        className="block text-sm font-medium text-text-secondary mb-1.5"
      >
        {label}
      </label>
      <select
        id="visit-type"
        value={value}
        onChange={(e) => onChange(e.target.value as VisitType)}
        disabled={disabled}
        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {VISIT_TYPE_KEYS.map((key) => (
          <option key={key} value={key}>
            {options[key] ?? key}
          </option>
        ))}
      </select>
    </div>
  );
}

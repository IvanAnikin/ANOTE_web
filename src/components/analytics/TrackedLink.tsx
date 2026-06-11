"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface TrackedLinkProps {
  href: string;
  eventName: "cta_click" | "email_click" | "phone_click";
  eventProps?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
}

export function TrackedLink({
  href,
  eventName,
  eventProps,
  className,
  children,
}: TrackedLinkProps) {
  const handleClick = () => {
    trackEvent(eventName, eventProps);
  };

  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

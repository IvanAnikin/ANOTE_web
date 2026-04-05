"use client";

import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItemData {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItemData[];
  className?: string;
  onItemOpen?: (title: string) => void;
}

export function Accordion({ items, className, onItemOpen }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn("divide-y divide-border", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="group">
            <button
              onClick={() => {
                const willOpen = !isOpen;
                setOpenId(willOpen ? item.id : null);
                if (willOpen) onItemOpen?.(item.title);
              }}
              className="flex w-full items-center justify-between py-5 text-left transition-colors hover:bg-black/[0.02] px-2 rounded-lg cursor-pointer"
            >
              <span className="text-lg font-semibold text-text-primary pr-4">
                {item.title}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-text-secondary transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-2 pb-5 text-text-secondary leading-relaxed">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SectionDividerProps {
  flip?: boolean;
  className?: string;
  color?: string;
}

export function SectionDivider({
  flip = false,
  className = "",
  color = "currentColor",
}: SectionDividerProps) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={`w-full h-[40px] md:h-[60px] lg:h-[80px] block ${flip ? "rotate-180" : ""} ${className}`}
    >
      <path
        d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
        fill={color}
      />
    </svg>
  );
}

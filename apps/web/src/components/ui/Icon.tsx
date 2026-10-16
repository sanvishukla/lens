const PATHS = {
  speech: "M4 5h16v10H10l-5 4v-4H4z M8 9h8 M8 12h5",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  keyboard: "M3 6h18v12H3z M7 10h.01 M11 10h.01 M15 10h.01 M19 10h.01 M7 14h10",
  hand: "M9 11V5.5a1.5 1.5 0 0 1 3 0V10 M12 9.5a1.5 1.5 0 0 1 3 0V11 M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.5a6 6 0 0 1-4.9-2.6L4 14.5a1.5 1.5 0 0 1 2.4-1.8L9 15",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z",
  arrow: "M5 12h14 M13 6l6 6-6 6",
} as const;

export type IconName = keyof typeof PATHS;

/** Decorative only: always pair with visible text. */
export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="icon"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

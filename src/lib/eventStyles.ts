import { cva, type VariantProps } from "class-variance-authority";

// Base classes for the event chips
export const CHIP_BASE =
  // full width pills, tighter padding on small screens, consistent alignment
  "w-full min-w-0 block truncate rounded-md border text-left text-xs " +
  "px-1.5 sm:px-2 leading-4 sm:leading-5";

export const STATUS_CLASSES = {
  paid: "bg-green-100 text-green-800 border-green-300",
  unpaid: "bg-yellow-100 text-yellow-800 border-yellow-300",
  blocked: "bg-gray-200 text-gray-700 border-gray-300 italic",
  hold: "bg-sky-100 text-sky-800 border-sky-300",
} as const;

export type StatusKey = keyof typeof STATUS_CLASSES;

export const chipVariants = cva(CHIP_BASE, {
  variants: {
    status: STATUS_CLASSES,
    view: {
      // tighter vertical padding on small screens to fit more text visually
      month: "h-5 py-0.5",
      week: "h-6 py-1",
      day: "h-7 py-1",
    },
    selected: {
      true: "ring-2 ring-offset-1 ring-primary",
      false: "",
    },
  },
  defaultVariants: { view: "month" },
});

export type ChipVariantProps = VariantProps<typeof chipVariants>;

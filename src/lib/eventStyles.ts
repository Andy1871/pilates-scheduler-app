import { cva, type VariantProps } from "class-variance-authority";

// Base classes for the event chips
export const CHIP_BASE =
  "w-full truncate rounded-md border px-2 leading-5 text-xs";

  // Shared styles so chip and block stay consistent 
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

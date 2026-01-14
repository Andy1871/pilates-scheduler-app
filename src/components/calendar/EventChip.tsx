import { cn } from "@/lib/utils";
import EventContent, { buildEventLabel } from "./EventContent";
import { chipVariants, type ChipVariantProps } from "@/lib/eventStyles";

type Props = {
  title: string;
  timeLabel?: string;
  classType?: string;
  status: "paid" | "unpaid" | "blocked" | "hold";
  selected?: boolean;
  className?: string;
  onClick?: (e:React.MouseEvent<HTMLButtonElement>) => void;
} & ChipVariantProps;

export default function EventChip({
  title,
  timeLabel,
  classType,
  status,
  view,
  selected,
  className,
  onClick,
}: Props) {
  const normalizedView: "month" | "week" | "day" = view ?? "month";
  const label = buildEventLabel({ title, timeLabel, classType, view: normalizedView });

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        chipVariants({ status, view: normalizedView, selected }),
        className
      )}
      aria-pressed={selected}
      aria-label={`${label}${status ? ` (${status})` : ""}`}
      title={label}
    >
      <EventContent
        title={title}
        timeLabel={timeLabel}
        classType={classType}
        status={status}
        view={normalizedView}
      />
    </button>
  );
}

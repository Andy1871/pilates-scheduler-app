import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns'
type Props = {
  viewDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export default function CalendarHeader({
  viewDate,
  onPrev,
  onNext,
  onToday,
}: Props) {
  return (
    <header className="w-full">
      <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-2 py-2">
        <div className="order-1 md:order-1 col-start-1 justify-self-start flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={onPrev}
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" className="text-sm h-8" onClick={onToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={onNext}
          >
            <ChevronRight />
          </Button>
        </div>

        <div className="order-2 md:order-3 col-start-3 md:col-start-3 justify-self-end flex items-center gap-2">
          <Button variant="outline" className="h-8">
            Add +
          </Button>
          <Button variant="secondary" className="h-8">
            Block -
          </Button>
        </div>

        <h3 className="order-3 md:order-2 col-span-3 md:col-span-1 md:col-start-2 justify-self-center text-center text-lg font-semibold mt-2 md:mt-0">
          {format(viewDate, "MMMM yyyy")}
        </h3>
      </div>
    </header>
  );
}

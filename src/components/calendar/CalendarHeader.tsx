import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"

export default function CalendarHeader() {
  const currentDate = new Date()

  return (
    <header className="w-full">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2">
        <div className="justify-self-start flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-8">
            <ChevronLeft />
          </Button>
          <Button variant="outline" className="text-sm h-8">
            Today
          </Button>
          <Button variant="outline" size="icon" className="size-8">
            <ChevronRight />
          </Button>
        </div>

        <h3 className="justify-self-center text-center text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h3>

        <div className="justify-self-end flex items-center gap-2">
          <Button variant="outline" className="h-8">
            Add +
          </Button>
          <Button variant="secondary" className="h-8">
            Block -
          </Button>
        </div>
      </div>
    </header>
  );
}

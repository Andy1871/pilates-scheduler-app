export type EventStatus = "paid" | "unpaid" | "blocked" | "hold";
export type EventKind = "booking" | "block"
export type ClassType = "reformer" | "mat" | "duo";

type BaseEvent = {
  id: string;
  start: string; 
  end: string;  
  notes?: string;
  seriesId?: string | null;
};

export type BookingEvent = BaseEvent & {
  kind: "booking";
  status: Exclude<EventStatus, "blocked">; 
  person: string;       
  classType: ClassType; 
};

export type BlockEvent = BaseEvent & {
  kind: "block";
  status: "blocked";
  reason: string;       
};

export type CalendarEvent = BookingEvent | BlockEvent;
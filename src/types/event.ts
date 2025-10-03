export type EventStatus = "paid" | "unpaid" | "blocked" | "hold";
export type EventKind = "booking" | "block"
export type ClassType = "reformer" | "mat" | "duo";

type BaseEvent = {
  id: string;
  start: string; 
  end: string;  
  notes?: string;
};

export type BookingEvent = BaseEvent & {
  kind: "booking";
  status: Exclude<EventStatus, "blocked">; // "paid" | "unpaid" | "hold"
  person: string;       // client name
  classType: ClassType; // reformer/mat/duo
};

export type BlockEvent = BaseEvent & {
  kind: "block";
  status: "blocked";
  reason: string;       // why the time is blocked
};

export type CalendarEvent = BookingEvent | BlockEvent;
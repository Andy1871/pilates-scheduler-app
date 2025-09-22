export type EventStatus = "paid" | "unpaid" | "blocked" | "hold";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; 
  end: string;
  status: EventStatus;
  person?: string;
}

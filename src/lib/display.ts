import { ClassType, EventStatus } from "@/types/event";

export const CLASS_LABEL: Record<ClassType, string> = {
    reformer: "Reformer",
    mat: "Mat",
    duo: "Duo",
  };
  
  export const STATUS_LABEL: Record<EventStatus, string> = {
    paid: "Paid",
    unpaid: "Unpaid",
    blocked: "Blocked",
    hold: "Hold",
  };
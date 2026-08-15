export { default as Event } from "./event.model";
export { default as Booking } from "./booking.model";

// Re-export interfaces for use in server actions, API routes, and other modules
export type { IEvent } from "./event.model";
export type { IBooking } from "./booking.model";

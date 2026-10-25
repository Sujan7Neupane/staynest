export type Room = {
  id: string;
  roomNumber: string;
  name: string;
  pricePerNight: number | string;
  maxGuests: number;
  status: "AVAILABLE" | "MAINTENANCE" | "UNAVAILABLE";
};

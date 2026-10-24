export type Property = {
  id: string;
  title: string;
  city: string;
  country: string;
  type: "HOTEL" | "VACATION_RENTAL";
  imageUrl: string | null;
  pricePerNight: number | string;
  maxGuests: number;
};

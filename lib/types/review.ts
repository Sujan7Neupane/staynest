export type Review = {
  id: string;
  guestId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  guest: {
    name: string | null;
    profileImageUrl: string | null;
  };
};

export type Booking = {
  id: string;
  status: string;
  property: {
    id: string;
    title: string;
  };
  review: {
    id: string;
  } | null;
};

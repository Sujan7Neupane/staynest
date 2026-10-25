import Link from "next/link";
import prisma from "@/prisma/client";
import Button from "../ui/Button";
import BookingForm from "./BookingForm";

type PropertyDetailsProps = {
  id: string;
};

export default async function PropertyDetails({ id }: PropertyDetailsProps) {
  "use cache";
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      rooms: {
        orderBy: {
          roomNumber: "asc",
        },
      },
    },
  });

  if (!property) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold">Property not found</p>
        <Link
          href="/"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to stays
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/" className="text-sm text-gray-600 hover:text-black">
        &larr; Back to stays
      </Link>

      <div className="mt-6">
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
            alt={property.title}
            className="h-80 w-full rounded-2xl object-cover sm:h-112.5"
          />
        ) : (
          <div className="flex h-80 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
            No image available
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_300px]">
        <div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
            {property.type === "HOTEL" && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">Rooms</h2>

                {property.rooms.length === 0 ? (
                  <p className="mt-3 text-gray-600">
                    No rooms have been added yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {property.rooms.map((room) => (
                      <article
                        key={room.id}
                        className="rounded-xl border border-gray-200 p-5"
                      >
                        <h3 className="text-lg font-semibold">{room.name}</h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Room {room.roomNumber}
                        </p>

                        {room.description && (
                          <p className="mt-3 text-gray-600">
                            {room.description}
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            Up to {room.maxGuests} guests
                          </p>

                          <p className="font-semibold">
                            {Number(room.pricePerNight).toFixed(2)}
                            <span className="ml-1 text-sm font-normal text-gray-500">
                              / night
                            </span>
                          </p>
                        </div>

                        <p className="mt-3 text-sm text-gray-500">
                          Status: {room.status}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </span>

          <h1 className="mt-4 text-3xl font-bold">{property.title}</h1>

          <p className="mt-2 text-gray-600">
            {property.address}, {property.city}, {property.country}
          </p>

          <div className="mt-6 border-y border-gray-200 py-5">
            <p className="font-medium">Up to {property.maxGuests} guests</p>
            <p className="mt-2 text-gray-600">
              {property.bedrooms} bedrooms · {property.bathrooms} bathrooms
            </p>
          </div>

          <section className="mt-6">
            <h2 className="text-xl font-semibold">About this property</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
              {property.description}
            </p>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">Reserve your stay</h2>

          <BookingForm
            propertyId={property.id}
            propertyType={property.type}
            propertyPrice={property.pricePerNight.toString()}
            propertyMaxGuests={property.maxGuests}
            rooms={property.rooms.map((room) => ({
              id: room.id,
              roomNumber: room.roomNumber,
              name: room.name,
              pricePerNight: room.pricePerNight.toString(),
              maxGuests: room.maxGuests,
              status: room.status,
            }))}
          />
        </aside>
      </div>
    </div>
  );
}

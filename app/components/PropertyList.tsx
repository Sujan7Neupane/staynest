import Link from "next/link";
import { Property } from "../../lib/types/property";

type PropertyListProps = {
  properties: Property[];
};

export default function PropertyList({ properties }: PropertyListProps) {
  //   console.log(properties);

  if (properties.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 p-12 text-center">
        <h3 className="text-lg font-semibold">No properties found</h3>
        <p className="mt-2 text-gray-600">
          Try another destination or change your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <Link
          key={property.id}
          href={`/properties/${property.id}`}
          className="block overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="h-56 bg-gray-100">
            {property.imageUrl ? (
              <img
                src={property.imageUrl}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          <div className="p-5">
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {property.type === "HOTEL" ? "Hotel" : "Vacation rental"}
            </span>

            <h3 className="mt-3 text-xl font-semibold">{property.title}</h3>

            <p className="mt-1 text-sm text-gray-500">
              {property.city}, {property.country}
            </p>

            <p className="mt-3 text-sm text-gray-600">
              {property.maxGuests} guests
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-lg font-semibold">
                {Number(property.pricePerNight).toFixed(2)}
                <span className="ml-1 text-sm font-normal text-gray-500">
                  per night
                </span>
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

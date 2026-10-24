"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import HomeSearchForm from "./HomeSearchForm";
import PropertyList from "../PropertyList";
import { Property } from "../../../lib/types/property";

type SearchValues = {
  city: string;
  type: string;
};

type HomeContentProps = {
  initialCity: string;
  initialType: string;
  initialProperties: Property[];
};

export default function HomeContent({
  initialCity,
  initialType,
  initialProperties,
}: HomeContentProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [city, setCity] = useState(initialCity);
  const [type, setType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchProperties = useCallback(async (values: SearchValues) => {
    setLoading(true);
    setError("");

    try {
      const params: SearchValues = {
        city: values.city.trim(),
        type: values.type,
      };

      const response = await axios.get("/api/properties", { params });

      setProperties(response.data.properties);
      setCity(params.city);
      setType(params.type);

      const query = new URLSearchParams();

      if (params.city) {
        query.set("city", params.city);
      }

      if (params.type) {
        query.set("type", params.type);
      }

      const queryString = query.toString();
      const url = queryString ? `/?${queryString}#stays` : "/#stays";

      window.history.pushState({}, "", url);
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to load properties."
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    function handlePopState() {
      const params = new URLSearchParams(window.location.search);

      const nextCity = params.get("city") || "";
      const requestedType = params.get("type") || "";
      const nextType =
        requestedType === "HOTEL" || requestedType === "VACATION_RENTAL"
          ? requestedType
          : "";

      setCity(nextCity);
      setType(nextType);

      void searchProperties({
        city: nextCity,
        type: nextType,
      });
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [searchProperties]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Your next stay starts here
          </p>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Find a place that feels like home.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Discover comfortable hotels and unique vacation rentals for your
            next trip.
          </p>

          <HomeSearchForm
            initialCity={city}
            initialType={type}
            loading={loading}
            onSearch={searchProperties}
          />
        </div>
      </section>

      <section id="stays" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">FIND YOUR STAY</p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Places to stay
          </h2>

          <p className="mt-2 text-gray-600">
            Explore available properties for your next trip.
          </p>
        </div>

        {loading && (
          <p className="py-8 text-center text-gray-500">
            Searching properties...
          </p>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => void searchProperties({ city, type })}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && <PropertyList properties={properties} />}
      </section>
    </main>
  );
}

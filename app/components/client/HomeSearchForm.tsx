"use client";

import { useState } from "react";
import FormInput from "../ui/FormInput";
import Button from "../ui/Button";

type HomeSearchFormProps = {
  initialCity: string;
  initialType: string;
  loading: boolean;
  onSearch: (values: { city: string; type: string }) => void;
};

export default function HomeSearchForm({
  initialCity,
  initialType,
  loading,
  onSearch,
}: HomeSearchFormProps) {
  const [city, setCity] = useState(initialCity);
  const [type, setType] = useState(initialType);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSearch({ city, type });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 flex max-w-3xl flex-col gap-3 sm:flex-row"
    >
      <FormInput
        label="Search"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Search by city"
        className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="rounded-sm border border-gray-300 px-2 py-2"
      >
        <option value="">All types</option>
        <option value="HOTEL">Hotel</option>
        <option value="VACATION_RENTAL">Vacation rental</option>
      </select>

      <Button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
}

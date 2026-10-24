import { Suspense } from "react";
import HomeContent from "../components/client/HomeContent";

type HomeProps = {
  searchParams: Promise<{
    city?: string | string[];
    type?: string | string[];
  }>;
};

async function HomeSearchResults({ searchParams }: HomeProps) {
  const params = await searchParams;

  const city = typeof params.city === "string" ? params.city.trim() : "";

  const type =
    params.type === "HOTEL" || params.type === "VACATION_RENTAL"
      ? params.type
      : "";

  return (
    <HomeContent initialCity={city} initialType={type} initialProperties={[]} />
  );
}

export default function Home(props: HomeProps) {
  return (
    <Suspense fallback={<p className="p-8">Loading stays...</p>}>
      <HomeSearchResults searchParams={props.searchParams} />
    </Suspense>
  );
}

import { Suspense } from "react";
import PropertyDetails from "@/app/components/client/PropertyDetails";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function PropertyPageContent({ params }: PageProps) {
  const { id } = await params;

  return <PropertyDetails id={id} />;
}

export default function PropertyPage(props: PageProps) {
  return (
    <Suspense
      fallback={<p className="py-20 text-center">Loading property...</p>}
    >
      <PropertyPageContent params={props.params} />
    </Suspense>
  );
}

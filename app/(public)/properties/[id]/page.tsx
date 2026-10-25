import PropertyDetails from "@/app/components/client/PropertyDetails";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyPage({ params }: PageProps) {
  const { id } = await params;

  return <PropertyDetails id={id} />;
}

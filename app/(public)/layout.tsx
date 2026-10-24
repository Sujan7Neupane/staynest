import { Suspense } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>

      <main>{children}</main>

      <Footer />
    </>
  );
}

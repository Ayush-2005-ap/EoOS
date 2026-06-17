import React from "react";
import { fetchDomains } from "@/services/api";

export async function generateStaticParams() {
  try {
    const domains = await fetchDomains();
    return domains.map((domain) => ({ id: domain.id }));
  } catch (error) {
    console.error(error);
    return [{ id: "default" }];
  }
}

export default function AdminDomainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

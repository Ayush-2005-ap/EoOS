import React from "react";
import { fetchStates } from "@/services/api";

export async function generateStaticParams() {
  try {
    const states = await fetchStates();
    return states.map((state) => ({ id: state.id }));
  } catch (error) {
    console.error(error);
    return [{ id: "default" }];
  }
}

export default function AdminStateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

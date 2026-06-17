import React from "react";

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/admin/hierarchy`);
    const json = await res.json();
    const ids: {id: string}[] = [];
    if (json.data) {
      json.data.forEach((d: any) => {
        d.indicators?.forEach((ind: any) => ids.push({ id: ind.id }));
      });
    }
    return ids.length > 0 ? ids : [{ id: "default" }];
  } catch (error) {
    console.error(error);
    return [{ id: "default" }];
  }
}

export default function AdminIndicatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

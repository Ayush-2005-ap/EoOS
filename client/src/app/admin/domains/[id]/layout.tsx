import React from "react";

export async function generateStaticParams() {
  // Return a dummy ID so Next.js static export succeeds.
  // Note: True dynamic rendering of unknown IDs requires a Node.js server.
  return [{ id: "default" }];
}

export default function AdminDomainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

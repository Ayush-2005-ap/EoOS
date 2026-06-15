import { fetchStates } from "@/services/api";

export async function generateStaticParams() {
  try {
    const states = await fetchStates();
    return states.map((state) => ({
      id: state.id,
    }));
  } catch (error) {
    console.error("Failed to fetch states for static generation", error);
    return [];
  }
}

export default function StateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

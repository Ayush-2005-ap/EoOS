export interface ApiStateData {
  id: string;
  name: string;
  type: "STATE" | "UT";
  region: string;
  baseScore: number;
  baseRank: number;
  pdfUrl?: string;
  scores: Record<string, number>;
  indicators?: Record<string, { name: string; score: number }[]>;
}

export interface ApiStateProfile extends Omit<ApiStateData, 'scores'> {
  stateOfSchooling: string | null;
  regulatoryFramework: string | null;
  domains: {
    domainId: string;
    domainName: string;
    score: number;
    indicators: {
      indicatorId: string;
      indicatorName: string;
      score: number;
      subIndicators: {
        id: string;
        name: string;
        score: number;
        status: string;
      }[];
    }[];
  }[];
}

export interface ApiDomain {
  id: string;
  name: string;
  description: string;
  defaultWeight: number;
  indicators?: any[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api";

export async function fetchStates(): Promise<ApiStateData[]> {
  const res = await fetch(`${API_BASE_URL}/states`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch states");
  const json = await res.json();
  return json.data;
}

export async function fetchStateById(id: string): Promise<ApiStateProfile> {
  const res = await fetch(`${API_BASE_URL}/states/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch state ${id}`);
  const json = await res.json();
  return json.data;
}

export async function fetchDomains(): Promise<ApiDomain[]> {
  const res = await fetch(`${API_BASE_URL}/domains`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch domains");
  const json = await res.json();
  return json.data;
}

export interface ApiStateData {
  id: string;
  name: string;
  type: "STATE" | "UT";
  region: string;
  baseScore: number;
  baseRank: number;
  scores: Record<string, number>;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api";

export async function fetchStates(): Promise<ApiStateData[]> {
  const res = await fetch(`${API_BASE_URL}/states`);
  if (!res.ok) throw new Error("Failed to fetch states");
  const json = await res.json();
  return json.data;
}

export async function fetchStateById(id: string): Promise<ApiStateProfile> {
  const res = await fetch(`${API_BASE_URL}/states/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch state ${id}`);
  const json = await res.json();
  return json.data;
}

export async function fetchDomains(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/domains`);
  if (!res.ok) throw new Error("Failed to fetch domains");
  const json = await res.json();
  return json.data;
}

export type Supplier = {
  id: string;
  name: string;
  os_id?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  contributor?: string;
  facilityType?: string;
  productCategory?: string;
  indicators?: {
    countryGovernance?: number; // 0-100
    laborRights?: number; // 0-100
    environmental?: number; // 0-100
    sectorCompliance?: number; // 0-100
  };
};

export const weights = {
  countryGovernance: 0.3,
  laborRights: 0.3,
  environmental: 0.25,
  sectorCompliance: 0.15,
};

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function computeRiskScore(s: Supplier): number {
  const i = s.indicators || {};
  const cg = i.countryGovernance ?? 50;
  const lr = i.laborRights ?? 50;
  const env = i.environmental ?? 50;
  const sec = i.sectorCompliance ?? 50;

  const score =
    cg * weights.countryGovernance +
    lr * weights.laborRights +
    env * weights.environmental +
    sec * weights.sectorCompliance;

  return Math.round(clamp(score));
}

export function riskColor(score: number): "green" | "yellow" | "red" {
  if (score >= 70) return "green";
  if (score >= 40) return "yellow";
  return "red";
}

export function colorClass(score: number): string {
  const color = riskColor(score);
  if (color === "green") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (color === "yellow") return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
}

import type { Supplier } from "@/lib/risk";

export const mockSuppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Alpha Textiles Ltd",
    os_id: "OS-0001",
    country: "Bangladesh",
    latitude: 23.8103,
    longitude: 90.4125,
    contributor: "Open Supply Hub",
    facilityType: "Factory",
    productCategory: "Apparel",
    indicators: {
      countryGovernance: 45,
      laborRights: 50,
      environmental: 55,
      sectorCompliance: 60,
    },
  },
  {
    id: "sup-2",
    name: "Beta Components Co.",
    os_id: "OS-0002",
    country: "Vietnam",
    latitude: 21.0278,
    longitude: 105.8342,
    contributor: "OSH Public List",
    facilityType: "Assembly",
    productCategory: "Electronics",
    indicators: {
      countryGovernance: 62,
      laborRights: 58,
      environmental: 64,
      sectorCompliance: 68,
    },
  },
  {
    id: "sup-3",
    name: "Gamma Metals",
    os_id: "OS-0003",
    country: "Germany",
    latitude: 52.52,
    longitude: 13.405,
    contributor: "Contributor A",
    facilityType: "Smelter",
    productCategory: "Metals",
    indicators: {
      countryGovernance: 88,
      laborRights: 85,
      environmental: 80,
      sectorCompliance: 90,
    },
  },
];

export function getBrandSuppliers(brandSlug: string): Supplier[] {
  // POC: return mock dataset. Later: fetch from OSH by contributor list match.
  return mockSuppliers;
}

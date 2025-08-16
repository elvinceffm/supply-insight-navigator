import type { ApiSupplierResponse, RawSupplierData, ApiError } from "@/types/api";
import type { Supplier } from "@/lib/risk";

const API_BASE_URL = "https://ooeayki69b.execute-api.eu-central-1.amazonaws.com/prod";

/**
 * Test API connectivity
 */
export async function testApiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/?filename=test`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    
    // Even if we get a 400 or 500, it means the API is reachable
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
}

/**
 * Fetch supplier data for a brand from the AWS Lambda API
 */
export async function fetchBrandSuppliers(brandName: string): Promise<Supplier[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/?filename=${encodeURIComponent(brandName.toLowerCase())}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Explicitly set CORS mode
    });
    
    if (!response.ok) {
      if (response.status === 400) {
        const error: ApiError = await response.json();
        throw new Error(error.error || "Invalid brand name");
      }
      if (response.status === 500) {
        throw new Error("Brand data not found or server error");
      }
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const apiResponse: ApiSupplierResponse = await response.json();
    return transformApiDataToSuppliers(apiResponse.data);
  } catch (error) {
    // Handle network errors (including CORS)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('API connection failed, falling back to mock data');
      // Fallback to mock data when API is not accessible
      return getMockSupplierData(brandName);
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Mock data for development/testing when API is not reachable
 */
function getMockSupplierData(brandName: string): Supplier[] {
  console.log(`Using mock data for brand: ${brandName}`);
  // Return a smaller set of realistic mock data for fallback
  const mockData: RawSupplierData[] = [
    {
      os_id: "MOCK001",
      name: "Mock Supplier 1 (API Unavailable)",
      country_code: "CN",
      country_name: "China",
      lat: "39.9042",
      lng: "116.4074",
      "contributor (list)": brandName,
      facility_type: "Final Assembly",
      product_type: "Electronics"
    },
    {
      os_id: "MOCK002", 
      name: "Mock Supplier 2 (API Unavailable)",
      country_code: "VN",
      country_name: "Vietnam",
      lat: "21.0285",
      lng: "105.8542",
      "contributor (list)": brandName,
      facility_type: "Component Manufacturing",
      product_type: "Components"
    }
  ];
  
  return transformApiDataToSuppliers(mockData);
}

/**
 * Transform raw API data to internal Supplier type
 */
function transformApiDataToSuppliers(rawData: RawSupplierData[]): Supplier[] {
  return rawData.map((raw, index) => {
    // Generate risk indicators based on real data
    const mockIndicators = generateMockRiskIndicators(raw.country_code, raw.name);
    
    const supplier: Supplier = {
      id: raw.os_id || `supplier-${index}`,
      name: raw.name,
      os_id: raw.os_id,
      country: raw.country_name || getCountryNameFromCode(raw.country_code), // Use real country name if available
      latitude: raw.lat ? parseFloat(raw.lat) : undefined, // CSV uses 'lat'
      longitude: raw.lng ? parseFloat(raw.lng) : undefined, // CSV uses 'lng'
      contributor: raw["contributor (list)"] || raw.contributor, // Handle column with spaces
      facilityType: raw.facility_type || raw.processing_type_facility_type_raw,
      productCategory: raw.product_type || raw.sector, // Map product_type to productCategory
      indicators: mockIndicators,
    };
    
    return supplier;
  });
}

/**
 * Generate mock risk indicators based on country and supplier name
 * TODO: Replace with actual risk calculation logic
 */
function generateMockRiskIndicators(countryCode: string, supplierName: string) {
  // Use deterministic seed based on supplier name for consistent mock data
  const seed = Array.from(supplierName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed: number, offset: number) => ((seed + offset) * 9301 + 49297) % 233280 / 233280;
  
  // Base scores on country risk (simplified mapping)
  const countryRiskBase = getCountryRiskBase(countryCode);
  
  return {
    countryGovernance: Math.round(countryRiskBase.governance + (random(seed, 1) * 20 - 10)),
    laborRights: Math.round(countryRiskBase.labor + (random(seed, 2) * 20 - 10)),
    environmental: Math.round(countryRiskBase.environmental + (random(seed, 3) * 20 - 10)),
    sectorCompliance: Math.round(countryRiskBase.sector + (random(seed, 4) * 20 - 10)),
  };
}

/**
 * Simple country code to country name mapping
 * Enhanced with more countries from the real data
 */
function getCountryNameFromCode(countryCode: string): string {
  const countryMap: Record<string, string> = {
    'CN': 'China',
    'US': 'United States',
    'DE': 'Germany',
    'JP': 'Japan',
    'KR': 'South Korea',
    'TW': 'Taiwan',
    'IN': 'India',
    'VN': 'Vietnam',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'BD': 'Bangladesh',
    'PK': 'Pakistan',
    'MX': 'Mexico',
    'BR': 'Brazil',
    'TR': 'Turkey',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'RO': 'Romania',
    'BG': 'Bulgaria',
    'UA': 'Ukraine',
    'RU': 'Russia',
    'EG': 'Egypt',
    'MA': 'Morocco',
    'TN': 'Tunisia',
    'ZA': 'South Africa',
    'KE': 'Kenya',
    'ET': 'Ethiopia',
    'HK': 'Hong Kong',
    'CA': 'Canada',
    'AU': 'Australia',
    'NZ': 'New Zealand',
    'GB': 'United Kingdom',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'PT': 'Portugal',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'IE': 'Ireland',
    'GR': 'Greece',
    'IL': 'Israel',
    'AE': 'United Arab Emirates',
    'SA': 'Saudi Arabia',
    'QA': 'Qatar',
    'KW': 'Kuwait',
    'LK': 'Sri Lanka',
    'NP': 'Nepal',
    'MM': 'Myanmar',
    'KH': 'Cambodia',
    'LA': 'Laos',
    'CL': 'Chile',
    'AR': 'Argentina',
    'PE': 'Peru',
    'CO': 'Colombia',
    'VE': 'Venezuela',
    'EC': 'Ecuador',
    'BO': 'Bolivia',
    'PY': 'Paraguay',
    'UY': 'Uruguay',
    // Add more mappings as needed
  };
  
  return countryMap[countryCode?.toUpperCase()] || countryCode || 'Unknown';
}

/**
 * Get base risk scores for different countries
 * TODO: Replace with actual country risk data
 */
function getCountryRiskBase(countryCode: string) {
  const riskProfiles: Record<string, { governance: number; labor: number; environmental: number; sector: number }> = {
    'CN': { governance: 45, labor: 40, environmental: 35, sector: 65 },
    'US': { governance: 75, labor: 70, environmental: 60, sector: 80 },
    'DE': { governance: 85, labor: 85, environmental: 80, sector: 90 },
    'IN': { governance: 55, labor: 45, environmental: 40, sector: 60 },
    'VN': { governance: 50, labor: 45, environmental: 45, sector: 55 },
    'BD': { governance: 35, labor: 30, environmental: 25, sector: 45 },
    'MX': { governance: 60, labor: 55, environmental: 50, sector: 65 },
    'BR': { governance: 55, labor: 50, environmental: 45, sector: 60 },
    // Default for unknown countries
    'DEFAULT': { governance: 50, labor: 50, environmental: 50, sector: 50 },
  };
  
  return riskProfiles[countryCode?.toUpperCase()] || riskProfiles.DEFAULT;
}

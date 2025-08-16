// API Response types for the AWS Lambda supplier data endpoint

export interface ApiSupplierResponse {
  filename: string;
  rowCount: number;
  data: RawSupplierData[];
}

export interface RawSupplierData {
  os_id: string;
  contribution_date?: string;
  name: string;
  address?: string;
  country_code: string;
  country_name?: string;
  lat?: string;  // Note: CSV uses 'lat', not 'latitude'
  lng?: string;  // Note: CSV uses 'lng', not 'longitude'
  sector?: string;
  "contributor (list)"?: string; // Note: column has spaces and parentheses
  number_of_workers?: string;
  parent_company?: string;
  processing_type_facility_type_raw?: string;
  facility_type?: string;
  processing_type?: string;
  product_type?: string;
  is_closed?: string;
  // Allow for any additional fields that might be in the CSV
  [key: string]: string | undefined;
}

export interface ApiError {
  error?: string;
  message?: string;
}

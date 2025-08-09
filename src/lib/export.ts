import Papa from "papaparse";
import type { Supplier } from "./risk";

export function exportSuppliersCsv(filename: string, suppliers: Supplier[]) {
  const data = suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    os_id: s.os_id ?? "",
    country: s.country,
    latitude: s.latitude ?? "",
    longitude: s.longitude ?? "",
    contributor: s.contributor ?? "",
    facility_type: s.facilityType ?? "",
    product_category: s.productCategory ?? "",
  }));

  const csv = Papa.unparse(data, { header: true });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

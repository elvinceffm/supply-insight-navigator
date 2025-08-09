export type TrustedPartner = {
  name: string;
  country: string;
  productCategory: string;
  contactUrl?: string;
};

export const trustedPartners: TrustedPartner[] = [
  { name: "EverGreen Fabrics", country: "Portugal", productCategory: "Textiles", contactUrl: "https://example.com/evergreen" },
  { name: "SolarPrint", country: "Poland", productCategory: "Packaging" },
  { name: "Nordic Metals", country: "Sweden", productCategory: "Metals", contactUrl: "mailto:contact@nordic-metals.com" },
];

import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Supplier } from "@/lib/risk";
import { computeRiskScore, riskColor } from "@/lib/risk";

// Relax typings for POC environment
const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;
const AnyMarker = Marker as any;

// Fix default marker icons path in Vite
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon as any;

export type SupplierMapProps = {
  suppliers: Supplier[];
};

const colorToHue: Record<string, string> = {
  green: "#10b981",
  yellow: "#f59e0b",
  red: "#ef4444",
};

const SupplierMap: React.FC<SupplierMapProps> = ({ suppliers }) => {
  const center = useMemo(() => {
    const withCoords = suppliers.filter((s) => s.latitude && s.longitude);
    if (withCoords.length === 0) return [20, 0] as [number, number];
    const lat = withCoords.reduce((a, s) => a + (s.latitude || 0), 0) / withCoords.length;
    const lng = withCoords.reduce((a, s) => a + (s.longitude || 0), 0) / withCoords.length;
    return [lat, lng] as [number, number];
  }, [suppliers]);

  return (
    <div className="w-full h-[70vh] rounded-lg overflow-hidden border border-border">
      {/* @ts-ignore – react-leaflet typing quirk in this environment */}
      <AnyMapContainer center={center as any} zoom={2 as any} className="w-full h-full">
        {/* @ts-ignore */}
        <AnyTileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {suppliers.map((s) => {
          if (!s.latitude || !s.longitude) return null;
          const score = computeRiskScore(s);
          const color = colorToHue[riskColor(score)];
          const icon = L.divIcon({
            html: `<div style="background:${color}; width:12px; height:12px; border-radius:50%; box-shadow:0 0 0 3px rgba(0,0,0,.15)"></div>`,
            className: "",
            iconSize: [12, 12],
          });
          return (
            // @ts-ignore
            <AnyMarker position={[s.latitude, s.longitude] as any} key={s.id} icon={icon as any}>
              <Popup>
                <div className="text-sm">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-muted-foreground">{s.country}</div>
                  <div className="mt-1">Risk score: {score}</div>
                </div>
              </Popup>
            </AnyMarker>
          );
        })}
      </AnyMapContainer>
    </div>
  );
};

export default SupplierMap;

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Supplier } from "@/lib/risk";
import { computeRiskScore } from "@/lib/risk";

// Relax typings for POC environment
const AnyMapContainer = MapContainer as any;
const AnyTileLayer = TileLayer as any;
const AnyMarker = Marker as any;
const AnyGeoJSON = GeoJSON as any;

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
  wrapperClassName?: string; // allow previews with smaller height
  showMarkers?: boolean;
};

// Score -> HSL color (0 = red, 100 = green)
function scoreToHsl(score: number) {
  const clamped = Math.max(0, Math.min(100, score));
  const hue = 10 + (clamped / 100) * 120; // 10° red -> 130° green
  return `hsl(${hue} 75% 45%)`;
}

const SupplierMap: React.FC<SupplierMapProps> = ({ suppliers, wrapperClassName, showMarkers = true }) => {
  const center = useMemo(() => {
    const withCoords = suppliers.filter((s) => s.latitude && s.longitude);
    if (withCoords.length === 0) return [20, 0] as [number, number];
    const lat = withCoords.reduce((a, s) => a + (s.latitude || 0), 0) / withCoords.length;
    const lng = withCoords.reduce((a, s) => a + (s.longitude || 0), 0) / withCoords.length;
    return [lat, lng] as [number, number];
  }, [suppliers]);

  // Aggregate average score by country name (case-insensitive)
  const countryScore = useMemo(() => {
    const map = new Map<string, number[]>();
    suppliers.forEach((s) => {
      if (!s.country) return;
      const key = s.country.trim().toLowerCase();
      const arr = map.get(key) || [];
      arr.push(computeRiskScore(s));
      map.set(key, arr);
    });
    const avg: Record<string, number> = {};
    for (const [k, arr] of map.entries()) {
      avg[k] = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    }
    return avg;
  }, [suppliers]);

  const [world, setWorld] = useState<any | null>(null);
  useEffect(() => {
    fetch("/data/world.geojson")
      .then((r) => r.json())
      .then(setWorld)
      .catch(() => setWorld(null));
  }, []);

  const wrapperCls = wrapperClassName || "w-full h-[70vh] rounded-lg overflow-hidden border border-border";

  return (
    <div className={wrapperCls}>
      {/* @ts-ignore – react-leaflet typing quirk in this environment */}
      <AnyMapContainer center={center as any} zoom={2 as any} className="w-full h-full">
        {/* @ts-ignore */}
        <AnyTileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {world && (
          // @ts-ignore
          <AnyGeoJSON
            data={world}
            style={(feature: any) => {
              const name: string = (feature?.properties?.name || "").toLowerCase();
              const score = countryScore[name];
              const has = typeof score === "number" && !Number.isNaN(score);
              return {
                color: "hsl(var(--border))",
                weight: 0.6,
                fillColor: has ? scoreToHsl(score) : "hsl(210 5% 80% / 0.25)",
                fillOpacity: has ? 0.55 : 0.15,
              } as L.PathOptions;
            }}
          />
        )}

        {showMarkers &&
          suppliers.map((s) => {
            if (!s.latitude || !s.longitude) return null;
            const score = computeRiskScore(s);
            const icon = L.divIcon({
              html: `<div style="background:${scoreToHsl(score)}; width:12px; height:12px; border-radius:50%; box-shadow:0 0 0 3px rgba(0,0,0,.15)"></div>`,
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

import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { riskColor } from "@/lib/risk";

type Metric = { label: string; value?: number };

type RadialScoreProps = {
  value: number; // 0-100
  size?: number; // px
  stroke?: number; // px
  className?: string;
  tooltipMetrics?: Metric[];
};

function colorClasses(score: number) {
  const tone = riskColor(score);
  if (tone === "green") {
    return {
      stroke: "stroke-emerald-500",
      text: "text-emerald-700 dark:text-emerald-300",
    };
  }
  if (tone === "yellow") {
    return {
      stroke: "stroke-amber-500",
      text: "text-amber-700 dark:text-amber-300",
    };
  }
  return {
    stroke: "stroke-rose-500",
    text: "text-rose-700 dark:text-rose-300",
  };
}

function RadialBase({ value, size = 48, stroke = 6, className, colorOveride }: { value?: number; size?: number; stroke?: number; className?: string; colorOveride?: ReturnType<typeof colorClasses> }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gapDeg = 60; // leave a sleek top gap (~60°) so arc covers 300° (>270°)
  const arc = ((360 - gapDeg) / 360) * c;
  const progress = Math.max(0, Math.min(100, value ?? 0));
  const progressArc = (progress / 100) * arc;
  // rotate so the gap is centered at the top and the visible arc sweeps across the bottom
  const rotate = -90 - gapDeg / 2; // center gap at 12 o'clock

  const colors = colorOveride ?? colorClasses(progress);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <g transform={`rotate(${rotate} ${size / 2} ${size / 2})`}>
          {/* Track (muted) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className="stroke-muted-foreground/20"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${c - arc}`}
          />
          {/* Indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className={cn(colors.stroke)}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${progressArc} ${c - progressArc}`}
          />
        </g>
      </svg>
      <span className={cn("absolute text-xs font-semibold tabular-nums", (value ?? undefined) !== undefined ? colors.text : "text-muted-foreground")}
        aria-hidden
      >
        {value !== undefined ? Math.round(value) : "N/A"}
      </span>
    </div>
  );
}

export function RadialScore({ value, size = 48, stroke = 6, className, tooltipMetrics }: RadialScoreProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("cursor-help", className)} aria-label={`Risk score ${value} out of 100`} role="img">
            <RadialBase value={value} size={size} stroke={stroke} />
          </div>
        </TooltipTrigger>
        {tooltipMetrics && tooltipMetrics.length > 0 && (
          <TooltipContent className="max-w-[420px]">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Subcategory breakdown</div>
            <div className="grid grid-cols-5 gap-4 sm:grid-cols-5">
              {tooltipMetrics.map((m) => (
                <div key={m.label} className="flex flex-col items-center gap-1 min-w-[60px]">
                  <RadialBase value={m.value} size={44} stroke={5} />
                  <span className="text-[10px] text-center leading-tight text-muted-foreground">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export default RadialScore;

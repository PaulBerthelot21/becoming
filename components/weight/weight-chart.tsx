"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

type WeightChartProps = {
  labels: string[];
  weights: Array<number | null>;
  average7d: Array<number | null>;
  targetWeightKg?: number | null;
};

export function WeightChart({ labels, weights, average7d, targetWeightKg }: WeightChartProps) {
  const hasData = weights.some((value) => value != null);

  if (!hasData) {
    return (
      <p className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        Logge ton premier poids pour voir la courbe sur 30 jours.
      </p>
    );
  }

  const shortLabels = labels.map((label) => label.slice(5));

  return (
    <div className="h-64 w-full">
      <Line
        data={{
          labels: shortLabels,
          datasets: [
            {
              label: "Poids",
              data: weights,
              borderColor: "#18181b",
              backgroundColor: "rgba(24, 24, 27, 0.08)",
              pointRadius: 3,
              pointHoverRadius: 5,
              spanGaps: true,
              tension: 0.25,
            },
            {
              label: "Moyenne 7j",
              data: average7d,
              borderColor: "#059669",
              borderDash: [6, 4],
              pointRadius: 0,
              spanGaps: true,
              tension: 0.3,
            },
            ...(targetWeightKg != null
              ? [
                  {
                    label: "Cible",
                    data: labels.map(() => targetWeightKg),
                    borderColor: "#a1a1aa",
                    borderDash: [2, 4],
                    pointRadius: 0,
                    tension: 0,
                  },
                ]
              : []),
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { boxWidth: 12, font: { size: 11 } },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed.y;
                  if (value == null) return "";
                  return `${context.dataset.label}: ${value.toFixed(1)} kg`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { maxTicksLimit: 8, font: { size: 10 } },
            },
            y: {
              ticks: {
                callback: (value) => `${value} kg`,
                font: { size: 10 },
              },
            },
          },
        }}
      />
    </div>
  );
}

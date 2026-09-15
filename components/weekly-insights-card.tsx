import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type WeeklyInsightsCardProps = {
  lines: string[];
  from: string;
  to: string;
};

export function WeeklyInsightsCard({ lines, from, to }: WeeklyInsightsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights semaine</CardTitle>
        <CardDescription>
          {from} → {to}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {lines.map((line) => (
            <li key={line} className="rounded-md bg-muted/60 px-3 py-2">
              {line}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

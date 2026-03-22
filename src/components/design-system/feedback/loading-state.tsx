import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader } from "../primitives";

function LoadingBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 rounded-full bg-[var(--ds-surface-container-high)]/80 animate-pulse",
        className,
      )}
    />
  );
}

export function LoadingState({
  className,
  lines = 4,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <Card variant="nested" className={cn(className)}>
      <CardHeader className="gap-3">
        <LoadingBar className="h-3 w-24" />
        <LoadingBar className="h-8 w-3/5" />
        <LoadingBar className="h-4 w-4/5" />
      </CardHeader>
      <CardContent className="gap-3">
        {Array.from({ length: lines }).map((_, index) => (
          <LoadingBar key={index} className={index === lines - 1 ? "w-2/3" : "w-full"} />
        ))}
      </CardContent>
    </Card>
  );
}

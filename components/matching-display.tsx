"use client";

import { cn } from "@/lib/utils";

interface MatchingDisplayProps {
  data: any;
  title?: string;
  variant?: "default" | "correct" | "incorrect";
}

export function MatchingDisplay({
  data,
  title,
  variant = "default",
}: MatchingDisplayProps) {
  let matchingData = data;

  if (typeof data === "string") {
    try {
      matchingData = JSON.parse(data);
    } catch {
      return (
        <div className="space-y-2">
          {title && (
            <p className="text-sm font-medium text-foreground">{title}</p>
          )}
          <div className="rounded-md border bg-muted p-3 text-sm text-foreground">
            {data}
          </div>
        </div>
      );
    }
  }

  if (typeof matchingData !== "object" || matchingData === null) {
    return (
      <div className="space-y-2">
        {title && (
          <p className="text-sm font-medium text-foreground">{title}</p>
        )}
        <div className="rounded-md border bg-muted p-3 text-sm text-foreground">
          {String(matchingData)}
        </div>
      </div>
    );
  }

  const variantStyles = {
    default: {
      container: "border border-border",
      header: "bg-muted text-foreground",
      rowEven: "bg-background",
      rowOdd: "bg-muted/40",
      text: "text-foreground",
      indicator: "hidden",
    },
    correct: {
      container: "border-2 border-foreground/60",
      header: "bg-muted text-foreground",
      rowEven: "bg-background",
      rowOdd: "bg-muted/40",
      text: "text-foreground",
      indicator: "bg-foreground",
    },
    incorrect: {
      container: "border-2 border-foreground/30",
      header: "bg-muted text-foreground",
      rowEven: "bg-background",
      rowOdd: "bg-muted/40",
      text: "text-foreground",
      indicator: "bg-foreground/40",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center gap-2">
          <p className={cn("text-sm font-medium", styles.text)}>
            {title}
          </p>
        </div>
      )}

      <div className={cn("overflow-hidden rounded-lg", styles.container)}>
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className={cn("p-2 text-sm font-semibold", styles.header)}>
            Left
          </div>
          <div className={cn("p-2 text-sm font-semibold", styles.header)}>
            Right
          </div>
        </div>

        {Object.entries(matchingData).map(([key, value], index) => (
          <div
            key={key}
            className={cn(
              "grid grid-cols-2 divide-x divide-border",
              index % 2 === 0 ? styles.rowEven : styles.rowOdd
            )}
          >
            <div className={cn("p-2 text-sm", styles.text)}>
              {key}
            </div>
            <div className={cn("p-2 text-sm", styles.text)}>
              {String(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
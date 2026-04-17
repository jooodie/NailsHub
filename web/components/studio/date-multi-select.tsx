"use client";

import { useEffect, useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  dates: string[];
  defaultSelected: string[];
};

export function DateMultiSelect({ dates, defaultSelected }: Props) {
  const defaultSelectedSet = useMemo(() => new Set(defaultSelected), [defaultSelected]);
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    dates.forEach((date) => {
      next[date] = defaultSelectedSet.has(date);
    });
    setSelectedMap(next);
  }, [dates, defaultSelectedSet]);

  function selectAll() {
    setSelectedMap((prev) => {
      const next = { ...prev };
      dates.forEach((date) => {
        next[date] = true;
      });
      return next;
    });
  }

  function toggle(date: string, checked: boolean) {
    setSelectedMap((prev) => ({
      ...prev,
      [date]: checked,
    }));
  }

  const selectedCount = dates.reduce((acc, date) => acc + (selectedMap[date] ? 1 : 0), 0);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={selectAll} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
          全選
        </button>
        <span className="inline-flex items-center rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
          已選 {selectedCount} / {dates.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {dates.map((date) => {
          const checked = Boolean(selectedMap[date]);
          return (
            <label
              key={date}
              className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm"
            >
              <input
                type="checkbox"
                name="dates"
                value={date}
                checked={checked}
                onChange={(e) => toggle(date, e.target.checked)}
              />
              <span>{date.slice(-2)} 日</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

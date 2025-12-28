import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Trophy } from "lucide-react";

import { ActionMenu } from "@/components/ui/action-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NewMatchPrimarySplitCtaProps = {
  baseTo?: string;
  className?: string;
};

export function NewMatchPrimarySplitCta({ baseTo = "/matches/new", className }: NewMatchPrimarySplitCtaProps) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const base = baseTo.split("?")[0] || "/matches/new";
  const goScheduled = () => navigate(`${base}?mode=scheduled`);
  const goPlayed = () => navigate(`${base}?mode=played`);

  return (
    <div
      className={cn(
        buttonVariants({ variant: "primary", size: "md" }),
        "!p-0 !px-0 !gap-0 overflow-visible inline-flex items-stretch",
        "focus-within:outline-none focus-within:ring-0 focus-within:ring-offset-0",
        className
      )}
    >
      {/* LEFT */}
      <button
        type="button"
        onClick={goScheduled}
        className={[
          "h-full flex flex-1 items-center justify-center gap-2",
          "px-4",
          "leading-none",
          "bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0",
          "rounded-l-[var(--btn-radius)] rounded-r-none",
        ].join(" ")}
      >
        <Plus className="h-4 w-4" />
        <span>Новий матч</span>
      </button>

      <div className="self-stretch w-px bg-white/15" />

      {/* RIGHT — ActionMenu */}
      <ActionMenu
        open={open}
        onOpenChange={setOpen}
        align="end"
        sideOffset={8}
        contentClassName="w-72"
        triggerClassName="inline-flex"
        trigger={
          <button
            type="button"
            aria-label="Вибрати тип матчу"
            className={[
              "h-full flex items-center justify-center",
              "px-3",
              "leading-none",
              "bg-transparent border-0 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0",
              "rounded-r-[var(--btn-radius)] rounded-l-none",
            ].join(" ")}
          >
            <ChevronDown className="h-4 w-4 opacity-90" />
          </button>
        }
        items={[
          {
            key: "scheduled",
            label: "Додати запланований матч",
            icon: Plus,
            onSelect: () => {
              setOpen(false);
              goScheduled();
            },
          },
          {
            key: "played",
            label: "Додати зіграний матч",
            icon: Trophy,
            onSelect: () => {
              setOpen(false);
              goPlayed();
            },
          },
        ]}
      />
    </div>
  );
}

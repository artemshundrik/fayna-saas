// /components/ui/action-menu.tsx
import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type BaseItem = {
  key?: string;
  disabled?: boolean;
};

export type ActionMenuItem =
  | (BaseItem & {
      type?: "item";
      label: string;
      icon?: LucideIcon;
      onSelect: () => void;
      destructive?: boolean;
      muted?: boolean; // наприклад "До списку матчів"
    })
  | (BaseItem & {
      type: "separator";
    });

export type ActionMenuProps = {
  /** Елемент-тригер (будь-що: кнопка, іконка, сегмент стрілки і т.д.) */
  trigger: React.ReactNode;

  /** Пункти меню */
  items: ActionMenuItem[];

  /** Вирівнювання меню відносно тригера */
  align?: "start" | "center" | "end";

  /** Зміщення меню вниз */
  sideOffset?: number;

  /** Класи контейнера меню */
  contentClassName?: string;

  /** Клас для wrapper тригера */
  triggerClassName?: string;

  /** Якщо треба контролювати open ззовні */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ActionMenu({
  trigger,
  items,
  align = "end",
  sideOffset = 8,
  contentClassName,
  triggerClassName,
  open,
  onOpenChange,
}: ActionMenuProps) {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <div className={cn("inline-flex", triggerClassName)}>{trigger}</div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={sideOffset}
          className={cn(
            // як у тебе в MatchDetails: w-56, rounded-2xl, border, bg-card, shadow-lg
            "z-50 min-w-[224px] overflow-hidden rounded-2xl border border-border bg-card shadow-lg",
            // анімації мʼякі (як shadcn/radix)
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            contentClassName
          )}
        >
          {items.map((it, idx) => {
            if (it.type === "separator") {
              return <DropdownMenu.Separator key={it.key ?? `sep-${idx}`} className="h-px bg-border" />;
            }

            const Icon = it.icon;
            return (
              <DropdownMenu.Item
                key={it.key ?? `${it.label}-${idx}`}
                disabled={it.disabled}
                onSelect={(e) => {
                  e.preventDefault(); // щоб не фокусило/не скролило дивно в деяких браузерах
                  if (!it.disabled) it.onSelect();
                }}
                className={cn(
                  "flex cursor-default select-none items-center gap-2 px-4 py-3 text-sm outline-none",
                  "text-foreground",
                  "focus:bg-muted/40 data-[highlighted]:bg-muted/40",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  it.destructive && "text-destructive",
                  it.muted && "text-muted-foreground data-[highlighted]:text-foreground"
                )}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span className="flex-1">{it.label}</span>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

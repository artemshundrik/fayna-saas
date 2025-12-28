// src/pages/TournamentsAdminPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OperationalSummary } from "@/components/app/OperationalSummary";

import { ArrowRight, CalendarDays, Flag, Star, Trophy } from "lucide-react";

/* ================= TYPES ================= */

type Tournament = {
  id: string;
  name: string;
  season: string | null;
  league_name: string | null;
  age_group: string | null;
  external_url: string | null;
  logo_url: string | null;
};

type TeamTournamentRow = {
  is_primary: boolean;
  // важливо: може бути null, якщо FK битий/нема запису
  tournament: Tournament | null;
};

/* ================= CONFIG ================= */

const TEAM_ID = "389719a7-5022-41da-bc49-11e7a3afbd98";

/* ================= PAGE ================= */

export function TournamentsAdminPage() {
  const [items, setItems] = useState<TeamTournamentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    const total = items.length;
    const primary = items.filter((i) => i.is_primary).length;
    const seasons = new Set(items.map((i) => i.tournament?.season).filter(Boolean) as string[]).size;
    const leagues = new Set(items.map((i) => i.tournament?.league_name).filter(Boolean) as string[]).size;
    return { total, primary, seasons, leagues };
  }, [items]);

  const kpis = useMemo(
    () => [
      {
        key: "total",
        label: "Всього турнірів",
        value: String(stats.total),
        icon: Trophy,
        iconTone: "bg-blue-500/10 text-blue-600",
      },
      {
        key: "primary",
        label: "Основні",
        value: String(stats.primary),
        icon: Star,
        iconTone: "bg-amber-500/10 text-amber-600",
      },
      {
        key: "seasons",
        label: "Сезони",
        value: String(stats.seasons),
        icon: CalendarDays,
        iconTone: "bg-emerald-500/10 text-emerald-600",
      },
      {
        key: "leagues",
        label: "Ліги",
        value: String(stats.leagues),
        icon: Flag,
        iconTone: "bg-indigo-500/10 text-indigo-600",
      },
    ],
    [stats]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      // ✅ alias на FK: tournament:tournament_id(...)
      // Це змушує Supabase повернути 1 обʼєкт, а не масив.
      const { data, error } = await supabase
        .from("team_tournaments")
        .select(
          `
          is_primary,
          tournament:tournament_id (
            id,
            name,
            season,
            league_name,
            age_group,
            external_url,
            logo_url
          )
        `
        )
        .eq("team_id", TEAM_ID)
        .order("is_primary", { ascending: false });

      if (cancelled) return;

      if (error) {
        setItems([]);
        setLoading(false);
        return;
      }

      // ✅ типізація без кривих кастів, + null-safe
      setItems(((data ?? []) as unknown as TeamTournamentRow[]).filter((x) => !!x.tournament));
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-[84px] rounded-2xl" />
          <Skeleton className="h-[84px] rounded-2xl" />
          <Skeleton className="h-[84px] rounded-2xl" />
        </div>
      );
    }

    if (!items.length) {
      return (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Поки немає доданих турнірів
        </div>
      );
    }

    return (
      <div className="grid gap-3 md:grid-cols-2">
        {items.map(({ is_primary, tournament }) => {
          if (!tournament) return null;

          return (
            <Card
              key={tournament.id}
              className={cn(
                "group rounded-[var(--radius-inner)] border border-border bg-card transition-all",
                "hover:-translate-y-[1px] hover:shadow-[var(--shadow-floating)]"
              )}
            >
              <CardContent className="flex items-center gap-4 p-4">
                {/* LOGO */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/60 ring-1 ring-inset ring-border">
                  {tournament.logo_url ? (
                    <img
                      src={tournament.logo_url}
                      alt={tournament.name}
                      className="h-10 w-10 object-contain"
                    />
                  ) : (
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* INFO */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate font-semibold text-foreground">{tournament.name}</div>
                    {is_primary && <Badge variant="secondary">Основний</Badge>}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {tournament.season ? (
                      <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px]">
                        {tournament.season}
                      </Badge>
                    ) : null}
                    {tournament.league_name ? (
                      <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px]">
                        {tournament.league_name}
                      </Badge>
                    ) : null}
                    {tournament.age_group ? (
                      <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px]">
                        {tournament.age_group}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                {/* ACTION */}
                <Button asChild size="sm" variant="ghost" className="rounded-xl">
                  <Link to={`/admin/tournaments/${tournament.id}`}>
                    <span className="flex items-center gap-1">
                      Перейти <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }, [items, loading]);

  return (
    <div className="space-y-6">
      <OperationalSummary
        title="Турніри"
        subtitle="Змагання, в яких бере участь команда"
        hideNextUp
        kpis={kpis}
      />

      <Card className="rounded-[var(--radius-section)] border border-border bg-card shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Усі турніри</CardTitle>
            <p className="text-sm text-muted-foreground">Перегляд деталей і статусу</p>
          </div>
          <Badge variant="secondary">{items.length}</Badge>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    </div>
  );
}

// src/pages/OverviewPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OperationalSummary } from "@/components/app/OperationalSummary";

import {
  BarChart3,
  CalendarDays,
  MapPin,
  Swords,
  Plus,
  ArrowRight,
  Activity,
  Trophy,
  Target,
} from "lucide-react";

/* ================== TYPES ================== */

type MatchStatus = "scheduled" | "played" | "canceled";

type MatchRow = {
  id: string;
  opponent_name: string;
  opponent_logo_url?: string | null;
  match_date: string;
  status: MatchStatus | null;
  home_away: "home" | "away" | "neutral" | null;
  score_team: number | null;
  score_opponent: number | null;
};

type TrainingRow = {
  id: string;
  date: string;
  time: string | null;
  location: string | null;
};

type ActivityItem = {
  id: string;
  event_type: string | null;
  player: { first_name: string | null; last_name: string | null } | null;
  created_at: string;
};

type KPI = {
  matches: number;
  wins: number;
  goalsFor: number;
  goalsAgainst: number;
  attendanceRate: number;
};

/* ================== HELPERS ================== */

function formatDateTimeUA(iso: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function outcome(scoreTeam: number, scoreOpp: number) {
  if (scoreTeam > scoreOpp) return { label: "W", tone: "success" as const };
  if (scoreTeam < scoreOpp) return { label: "L", tone: "danger" as const };
  return { label: "D", tone: "neutral" as const };
}

function normalizeLogoUrl(url?: string | null) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, "");
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!supabaseUrl || !supabaseAnonKey) return trimmed;
  const looksRelative = trimmed.startsWith("/") || !/^https?:\/\//i.test(trimmed);
  const absoluteUrl = looksRelative ? `${supabaseUrl}/${trimmed.replace(/^\/+/, "")}` : trimmed;
  if (!absoluteUrl.startsWith(supabaseUrl)) return absoluteUrl;
  if (absoluteUrl.includes("apikey=")) return absoluteUrl;
  const sep = absoluteUrl.includes("?") ? "&" : "?";
  return `${absoluteUrl}${sep}apikey=${supabaseAnonKey}`;
}

function LogoCircle({ src, alt, size = 32, className }: { src?: string | null; alt: string; size?: number; className?: string }) {
  return (
    <div
      className={cn("shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border", className)}
      style={{ width: size, height: size }}
    >
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" /> : null}
    </div>
  );
}

function renderActivity(a: ActivityItem) {
  const playerLabel = a.player ? `${a.player.first_name ?? ""} ${a.player.last_name ?? ""}`.trim() : "Гравець";
  const type = (a.event_type ?? "").toLowerCase().trim();
  if (type === "goal") return `⚽ Гол — ${playerLabel}`;
  if (type === "penalty_scored") return `⚽ Пенальті — ${playerLabel}`;
  if (type === "own_goal") return `🥅 Автогол — ${playerLabel}`;
  if (type === "yellow_card") return `🟨 Картка — ${playerLabel}`;
  if (type === "red_card") return `🟥 Картка — ${playerLabel}`;
  if (type === "goalkeeper_save") return `🧤 Сейв — ${playerLabel}`;
  return "Подія";
}

/* ================== PAGE ================== */

export function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const TEAM_ID = "389719a7-5022-41da-bc49-11e7a3afbd98";
  const TEAM_NAME = "FAYNA TEAM";
  const [teamLogo, setTeamLogo] = useState<string | null>(null);

  const [nextMatch, setNextMatch] = useState<MatchRow | null>(null);
  const [lastMatch, setLastMatch] = useState<MatchRow | null>(null);
  const [nextTraining, setNextTraining] = useState<TrainingRow | null>(null);
  const [lastFive, setLastFive] = useState<MatchRow[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const [kpi, setKpi] = useState<KPI>({
    matches: 0,
    wins: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    attendanceRate: 0,
  });

  /* ================== LOAD DATA ================== */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const now = new Date().toISOString();
      const since14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const sinceDate = since14d.slice(0, 10);

      const [matchesRes, trainingsRes] = await Promise.all([
        supabase
          .from("matches")
          .select("id, opponent_name, opponent_logo_url, match_date, status, home_away, score_team, score_opponent")
          .eq("team_id", TEAM_ID)
          .order("match_date", { ascending: false })
          .limit(60),

        supabase
          .from("trainings")
          .select("id, date, time, location")
          .eq("team_id", TEAM_ID)
          .order("date", { ascending: true })
          .order("time", { ascending: true })
          .limit(24),
      ]);

      if (cancelled) return;
      if (matchesRes.error) {
        console.error("Overview matches load error", matchesRes.error);
      }
      if (trainingsRes.error) {
        console.error("Overview trainings load error", trainingsRes.error);
      }

      const matchesList = ((matchesRes.data as MatchRow[]) ?? []).map((m) => ({
        ...m,
        opponent_logo_url: normalizeLogoUrl(m.opponent_logo_url ?? null),
      }));
      let logo: string | null = null;
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("club_id")
        .eq("id", TEAM_ID)
        .single();

      if (!teamError && teamData?.club_id) {
        const { data: clubData, error: clubError } = await supabase
          .from("clubs")
          .select("logo_url")
          .eq("id", teamData.club_id)
          .single();

        if (!clubError) {
          const raw = (clubData as { logo_url?: string | null } | null)?.logo_url || null;
          logo = normalizeLogoUrl(raw);
        }
      }

      setTeamLogo(logo);
      const nowTs = Date.now();
      const isCanceled = (m: MatchRow) => (m.status ?? "scheduled") === "canceled";
      const pastMatches = matchesList.filter(
        (m) => !isCanceled(m) && new Date(m.match_date).getTime() < nowTs
      );
      const futureMatches = matchesList
        .filter((m) => !isCanceled(m) && new Date(m.match_date).getTime() >= nowTs)
        .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());

      const scoredMatches = pastMatches.filter(
        (m) => m.score_team !== null && m.score_opponent !== null
      );

      const nextMatchItem = futureMatches[0] ?? null;
      const lastMatchItem = pastMatches[0] ?? null;
      const lastFiveList = pastMatches.slice(0, 5);

      const trainingsList = (trainingsRes.data as TrainingRow[]) ?? [];
      const nextTrainingItem =
        trainingsList.find((t) => new Date(`${t.date}T${t.time || "00:00"}`).getTime() >= Date.now()) || null;

      const lastFiveIds = lastFiveList.map((m) => m.id).filter(Boolean);
      const activityRes = lastFiveIds.length
        ? await supabase
            .from("match_events")
            .select("id, event_type, created_at, player:player_id (first_name, last_name)")
            .in("match_id", lastFiveIds)
            .order("created_at", { ascending: false })
            .limit(6)
        : { data: [] };

      const recentTrainingsRes = await supabase
        .from("trainings")
        .select("id")
        .eq("team_id", TEAM_ID)
        .gte("date", sinceDate);
      const recentTrainingIds = ((recentTrainingsRes.data as { id: string }[]) ?? []).map((t) => t.id);
      const attendanceRes = recentTrainingIds.length
        ? await supabase
            .from("training_attendance")
            .select("status")
            .in("training_id", recentTrainingIds)
        : { data: [] };

      setNextMatch(nextMatchItem);
      setLastMatch(lastMatchItem);
      setLastFive(lastFiveList);
      setNextTraining(nextTrainingItem);
      setActivity((activityRes.data as any) ?? []);

      const wins = scoredMatches.filter((m) => (m.score_team ?? 0) > (m.score_opponent ?? 0)).length;
      setKpi((prev) => ({
        ...prev,
        matches: pastMatches.length,
        wins,
        goalsFor: scoredMatches.reduce((s, m) => s + (m.score_team ?? 0), 0),
        goalsAgainst: scoredMatches.reduce((s, m) => s + (m.score_opponent ?? 0), 0),
      }));

      if (attendanceRes.data) {
        const total = attendanceRes.data.length;
        const present = attendanceRes.data.filter((a) => a.status === "present").length;

        setKpi((prev) => ({
          ...prev,
          attendanceRate: total ? Math.round((present / total) * 100) : 0,
        }));
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ================== DERIVED ================== */

  const formBadges = useMemo(
    () =>
      lastFive
        .slice()
        .reverse()
        .map((m) =>
          m.score_team !== null && m.score_opponent !== null
            ? outcome(m.score_team, m.score_opponent)
            : { label: "—", tone: "neutral" as const }
        ),
    [lastFive]
  );

  /* ================== UI ================== */

  const kpis = useMemo(
    () => [
      {
        key: "matches",
        label: "Матчі",
        value: String(kpi.matches),
        icon: Swords,
        iconTone: "bg-sky-500/10 text-sky-600",
      },
      {
        key: "wins",
        label: "Перемоги",
        value: String(kpi.wins),
        icon: Trophy,
        iconTone: "bg-emerald-500/10 text-emerald-600",
      },
      {
        key: "goals",
        label: "Голи",
        value: `${kpi.goalsFor}/${kpi.goalsAgainst}`,
        icon: Target,
        iconTone: "bg-amber-500/10 text-amber-600",
      },
      {
        key: "attendance",
        label: "Відвідуваність",
        value: String(kpi.attendanceRate),
        unit: "%",
        icon: BarChart3,
        iconTone: "bg-indigo-500/10 text-indigo-600",
      },
    ],
    [kpi]
  );

  const nextMatchSides = useMemo(() => {
    if (!nextMatch) return null;
    const ha = nextMatch.home_away ?? "home";
    if (ha === "away") {
      return {
        left: { name: nextMatch.opponent_name, logo: nextMatch.opponent_logo_url ?? null },
        right: { name: TEAM_NAME, logo: teamLogo },
      };
    }
    return {
      left: { name: TEAM_NAME, logo: teamLogo },
      right: { name: nextMatch.opponent_name, logo: nextMatch.opponent_logo_url ?? null },
    };
  }, [nextMatch, teamLogo]);

  return (
    <div className="space-y-6">
      <OperationalSummary
        title="Огляд"
        subtitle="Ключові події команди та загальні показники."
        nextUpLoading={loading}
        nextUp={
          !loading && nextMatch && nextMatchSides
            ? {
                primary: formatDateTimeUA(nextMatch.match_date),
                secondary: `${nextMatchSides.left.name} — ${nextMatchSides.right.name}`,
                to: `/matches/${nextMatch.id}`,
                tournamentName: "Найближчий матч",
                avatars: [
                  { name: nextMatchSides.left.name, src: nextMatchSides.left.logo },
                  { name: nextMatchSides.right.name, src: nextMatchSides.right.logo },
                ],
              }
            : undefined
        }
        nextUpCtaLabel="Перейти до матчу"
        emptyState={{
          badgeLabel: "НАСТУПНИЙ МАТЧ",
          title: "Немає запланованих матчів",
          description: "Додай новий матч, щоб команда бачила час і суперника.",
          actionLabel: "Новий матч",
        }}
        primaryAction={{
          label: "Новий матч",
          to: "/matches/new",
          iconLeft: Plus,
          variant: "default",
        }}
        secondaryAction={{
          label: "Нове тренування",
          to: "/admin/trainings/create",
          iconLeft: CalendarDays,
          variant: "secondary",
        }}
        kpis={kpis}
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card className="rounded-[var(--radius-section)] border border-border bg-gradient-to-b from-card to-card/70 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Останній результат</CardTitle>
              {lastMatch ? (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDateTimeUA(lastMatch.match_date)}
                </div>
              ) : null}
            </CardHeader>
            <CardContent>
              {lastMatch ? (
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <div className="flex items-center justify-end gap-3 text-right min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{TEAM_NAME}</div>
                    <LogoCircle src={teamLogo} alt={TEAM_NAME} size={40} />
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                      {lastMatch.score_team ?? "—"}:{lastMatch.score_opponent ?? "—"}
                    </div>
                    {lastMatch.score_team !== null && lastMatch.score_opponent !== null ? (
                      <Badge tone={outcome(lastMatch.score_team, lastMatch.score_opponent).tone} className="mt-2">
                        {outcome(lastMatch.score_team, lastMatch.score_opponent).label}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-start gap-3 min-w-0">
                    <LogoCircle src={lastMatch.opponent_logo_url} alt={lastMatch.opponent_name} size={40} />
                    <div className="truncate text-sm font-semibold text-foreground">{lastMatch.opponent_name}</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Ще не грали</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[var(--radius-section)] border border-border bg-gradient-to-b from-card to-card/70 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Форма (5 матчів)</CardTitle>
              <div className="text-xs text-muted-foreground">Останні 5</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-1.5">
                  {formBadges.map((b, i) => (
                    <Badge key={i} tone={b.tone} className="h-6 w-6 justify-center rounded-full p-0 text-[11px]">
                      {b.label}
                    </Badge>
                  ))}
                </div>
                <span>Останні 5</span>
              </div>
              <Separator />
              {lastFive.length === 0 ? (
                <p className="text-sm text-muted-foreground">Матчів поки немає</p>
              ) : (
                <div className="space-y-2">
                  {lastFive.map((m) => {
                    const badge =
                      m.score_team !== null && m.score_opponent !== null
                        ? outcome(m.score_team, m.score_opponent)
                        : { label: "—", tone: "neutral" as const };
                    return (
                      <Link
                        key={m.id}
                        to={`/matches/${m.id}`}
                        className={cn(
                          "flex items-center justify-between rounded-xl border border-border px-3 py-2",
                          "bg-muted/20 transition-all hover:-translate-y-[1px] hover:bg-muted/40 hover:shadow-[var(--shadow-floating)]"
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Badge tone={badge.tone} className="h-7 w-7 justify-center rounded-full p-0">
                            {badge.label}
                          </Badge>
                          <LogoCircle src={m.opponent_logo_url} alt={m.opponent_name} size={32} />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">{m.opponent_name}</div>
                            <div className="text-xs text-muted-foreground">{formatDateTimeUA(m.match_date)}</div>
                          </div>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {m.score_team ?? "—"}:{m.score_opponent ?? "—"}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-[var(--radius-section)] border border-border bg-gradient-to-b from-card to-card/70 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4" /> Наступне тренування
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Завантаження…</p>
              ) : nextTraining ? (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-foreground">
                    {formatDateTimeUA(`${nextTraining.date}T${nextTraining.time || "00:00"}`)}
                  </div>
                  {nextTraining.location ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {nextTraining.location}
                    </div>
                  ) : null}
                  <Button asChild size="sm" variant="secondary" className="rounded-xl">
                    <Link to="/admin/trainings">Перейти</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Немає тренувань</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[var(--radius-section)] border border-border bg-gradient-to-b from-card to-card/70 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" /> Активність
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Подій поки немає — почніть з матчу або тренування
                </p>
              ) : (
                <div className="space-y-3">
                  {activity.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary/50 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]" />
                      <span>{renderActivity(a)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[var(--radius-section)] border border-border bg-gradient-to-b from-card to-card/70 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4" /> Швидкі дії
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-between rounded-xl">
                <Link to="/matches/new">
                  Новий матч <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full justify-between rounded-xl">
                <Link to="/admin/trainings/create">
                  Нове тренування <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

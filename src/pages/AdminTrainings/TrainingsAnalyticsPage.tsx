import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Loader2,
  ShieldAlert,
  Swords,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import { getTrainings } from "../../api/trainings";
import type { AttendanceStatus, Training } from "../../types/trainings";
import { supabase } from "../../lib/supabaseClient";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CONTROL_BASE } from "@/components/ui/controlStyles";

const TEAM_ID = "389719a7-5022-41da-bc49-11e7a3afbd98";

type TrainingType = "regular" | "sparring";

type Player = {
  id: string;
  first_name: string;
  last_name: string;
  shirt_number: number | null;
  position?: string | null;
  photo_url?: string | null;
};

type AttendanceRow = {
  training_id: string;
  player_id: string;
  status: AttendanceStatus;
  created_at?: string;
};

type PlayerAttendanceRow = {
  playerId: string;
  shirtNumber: number | null;
  photoUrl: string | null;
  position?: string | null;
  name: string;
  trainingsTracked: number;
  presentCount: number;
  absentCount: number;
  injuredCount: number;
  sickCount: number;
  attendancePercent: number | null;
};

type TypeAttendanceSummary = {
  type: TrainingType;
  trainingsCount: number;
  presentCount: number;
  absentCount: number;
  attendancePercent: number | null;
};

const typeLabels: Record<TrainingType, string> = {
  regular: "Звичайне тренування",
  sparring: "Спаринг",
};

const typeIcons: Record<TrainingType, React.ElementType> = {
  regular: ClipboardList,
  sparring: Swords,
};

const positionUkMap: Record<string, string> = {
  gk: "Воротар",
  goalkeeper: "Воротар",
  df: "Захисник",
  cb: "Центр. захисник",
  lb: "Лівий захисник",
  rb: "Правий захисник",
  mf: "Півзахисник",
  cm: "Центр. півзахисник",
  dm: "Опорний півзахисник",
  am: "Атак. півзахисник",
  fw: "Нападник",
  st: "Нападник",
  cf: "Центр. форвард",
  lf: "Лівий форвард",
  rf: "Правий форвард",
  wing: "Фланговий",
  universal: "Універсал",
  univ: "Універсал",
};

function round1(val: number) {
  return Math.round(val * 10) / 10;
}

export function TrainingsAnalyticsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [trainingsData, attendanceRes, playersRes] = await Promise.all([
          getTrainings(TEAM_ID),
          supabase.from("training_attendance").select("training_id, player_id, status, created_at"),
          supabase
            .from("players")
            .select("id, first_name, last_name, shirt_number, position, photo_url")
            .eq("team_id", TEAM_ID),
        ]);
        if (attendanceRes.error) throw attendanceRes.error;
        if (playersRes.error) throw playersRes.error;
        setTrainings(trainingsData);
        setAttendance((attendanceRes.data || []) as AttendanceRow[]);
        setPlayers((playersRes.data || []) as Player[]);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Не вдалося завантажити аналітику");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredTrainings = useMemo(() => {
    return trainings.filter((t) => {
      if (fromDate && t.date < fromDate) return false;
      if (toDate && t.date > toDate) return false;
      return true;
    });
  }, [trainings, fromDate, toDate]);

  const completedTrainings = useMemo(() => {
    const now = Date.now();
    return filteredTrainings.filter(
      (t) => new Date(`${t.date}T${t.time || "00:00"}`).getTime() <= now,
    );
  }, [filteredTrainings]);

  const filteredAttendance = useMemo(() => {
    const ids = new Set(completedTrainings.map((t) => t.id));
    return attendance.filter((a) => ids.has(a.training_id));
  }, [attendance, completedTrainings]);

  const dedupAttendance = useMemo(() => {
    const sorted = [...filteredAttendance].sort((a, b) => {
      const at = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
      return at - bt;
    });
    const map = new Map<string, AttendanceRow>();
    sorted.forEach((row) => {
      const key = `${row.training_id}_${row.player_id}`;
      map.set(key, row);
    });
    return Array.from(map.values());
  }, [filteredAttendance]);

  const typeSummaries: TypeAttendanceSummary[] = useMemo(() => {
    const summaries: TypeAttendanceSummary[] = [
      { type: "regular", trainingsCount: 0, presentCount: 0, absentCount: 0, attendancePercent: null },
      { type: "sparring", trainingsCount: 0, presentCount: 0, absentCount: 0, attendancePercent: null },
    ];
    const byTraining = new Map<string, TrainingType>();
    completedTrainings.forEach((t) => {
      if (t.type === "regular" || t.type === "sparring") {
        summaries[t.type === "regular" ? 0 : 1].trainingsCount += 1;
        byTraining.set(t.id, t.type);
      }
    });
    dedupAttendance.forEach((row) => {
      const tType = byTraining.get(row.training_id);
      if (!tType) return;
      const idx = tType === "regular" ? 0 : 1;
      if (row.status === "present") summaries[idx].presentCount += 1;
      if (row.status === "absent") summaries[idx].absentCount += 1;
    });
    summaries.forEach((s) => {
      const denom = s.presentCount + s.absentCount;
      s.attendancePercent = denom === 0 ? null : round1((s.presentCount / denom) * 100);
    });
    return summaries;
  }, [completedTrainings, dedupAttendance]);

  const globalSummary = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;
    let injuredCount = 0;
    let sickCount = 0;
    dedupAttendance.forEach((row) => {
      if (row.status === "present") presentCount += 1;
      if (row.status === "absent") absentCount += 1;
      if (row.status === "injured") injuredCount += 1;
      if (row.status === "sick") sickCount += 1;
    });
    const denom = presentCount + absentCount;
    return {
      presentCount,
      absentCount,
      injuredCount,
      sickCount,
      attendancePercent: denom === 0 ? null : round1((presentCount / denom) * 100),
    };
  }, [dedupAttendance]);

  const uniquePlayers = useMemo(() => {
    return new Set(dedupAttendance.map((row) => row.player_id)).size;
  }, [dedupAttendance]);

  const playerRows: PlayerAttendanceRow[] = useMemo(() => {
    const trainingsInPeriod = completedTrainings.length;
    const map = new Map<string, PlayerAttendanceRow>();
    players.forEach((p) => {
      map.set(p.id, {
        playerId: p.id,
        shirtNumber: p.shirt_number,
        photoUrl: p.photo_url || null,
        position: p.position,
        name:
          p.shirt_number !== null
            ? `#${p.shirt_number} ${p.last_name} ${p.first_name}`
            : `${p.last_name} ${p.first_name}`,
        trainingsTracked: trainingsInPeriod,
        presentCount: 0,
        absentCount: 0,
        injuredCount: 0,
        sickCount: 0,
        attendancePercent: null,
      });
    });

    dedupAttendance.forEach((row) => {
      const entry = map.get(row.player_id);
      if (!entry) return;
      if (row.status === "present") entry.presentCount += 1;
      if (row.status === "absent") entry.absentCount += 1;
      if (row.status === "injured") entry.injuredCount += 1;
      if (row.status === "sick") entry.sickCount += 1;
    });

    map.forEach((entry) => {
      const denom = entry.presentCount + entry.absentCount;
      entry.attendancePercent = denom === 0 ? null : round1((entry.presentCount / denom) * 100);
    });

    return Array.from(map.values()).sort((a, b) => {
      const pa = a.attendancePercent ?? -1;
      const pb = b.attendancePercent ?? -1;
      if (pb !== pa) return pb - pa;
      if (b.trainingsTracked !== a.trainingsTracked) return b.trainingsTracked - a.trainingsTracked;
      const na = a.shirtNumber ?? Number.MAX_SAFE_INTEGER;
      const nb = b.shirtNumber ?? Number.MAX_SAFE_INTEGER;
      return na - nb;
    });
  }, [players, dedupAttendance, completedTrainings.length]);

  const stableTop = useMemo(() => {
    return playerRows
      .filter((r) => r.trainingsTracked >= 3 && r.attendancePercent !== null)
      .sort((a, b) => {
        const pa = a.attendancePercent ?? -1;
        const pb = b.attendancePercent ?? -1;
        if (pb !== pa) return pb - pa;
        return b.trainingsTracked - a.trainingsTracked;
      })
      .slice(0, 3);
  }, [playerRows]);

  const absentTop = useMemo(() => {
    return playerRows
      .filter((r) => r.trainingsTracked >= 3)
      .sort((a, b) => {
        if (b.absentCount !== a.absentCount) return b.absentCount - a.absentCount;
        return b.trainingsTracked - a.trainingsTracked;
      })
      .filter((r) => r.absentCount > 0)
      .slice(0, 3);
  }, [playerRows]);

  const applyPreset = (preset: "thisMonth" | "lastMonth" | "thisWeek" | "thisYear") => {
    const today = new Date();
    if (preset === "thisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setFromDate(start.toISOString().slice(0, 10));
      setToDate(end.toISOString().slice(0, 10));
    }
    if (preset === "lastMonth") {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setFromDate(start.toISOString().slice(0, 10));
      setToDate(end.toISOString().slice(0, 10));
    }
    if (preset === "thisWeek") {
      const day = today.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setFromDate(monday.toISOString().slice(0, 10));
      setToDate(sunday.toISOString().slice(0, 10));
    }
    if (preset === "thisYear") {
      setFromDate(`${today.getFullYear()}-01-01`);
      setToDate(`${today.getFullYear()}-12-31`);
    }
  };

  const hasTrainings = filteredTrainings.length > 0;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Завантаження аналітики…
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Помилка</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const statPill = (value: string | number, className: string) => (
    <span className={cn("inline-flex min-w-[48px] items-center justify-end font-semibold tabular-nums", className)}>
      {value}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Аналітика тренувань</h1>
          <p className="text-sm text-muted-foreground">
            Відстежуй відвідуваність, лідерів присутності та тренувальні тренди.
          </p>
        </div>
      </div>

      <Card className="rounded-[var(--radius-section)] border border-border bg-card shadow-none">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg">Період</CardTitle>
            <p className="text-sm text-muted-foreground">Оберіть діапазон дат або пресет.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => applyPreset("thisWeek")}>Цей тиждень</Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("thisMonth")}>Цей місяць</Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("lastMonth")}>Минулий місяць</Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("thisYear")}>Цей рік</Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Початок
            </label>
            <div className="relative">
              <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.currentTarget.value)}
                className={cn(CONTROL_BASE, "pl-9")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Кінець
            </label>
            <div className="relative">
              <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.currentTarget.value)}
                className={cn(CONTROL_BASE, "pl-9")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasTrainings ? (
        <Card className="rounded-[var(--radius-section)] border border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Немає тренувань у вибраному періоді</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Змініть діапазон дат або створіть нове тренування.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-[var(--radius-inner)] border border-border bg-card shadow-none">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Всього тренувань</div>
                  <div className="text-2xl font-semibold tabular-nums">{completedTrainings.length}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ClipboardList className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[var(--radius-inner)] border border-border bg-card shadow-none">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Сер. відвідуваність</div>
                  <div className="text-2xl font-semibold tabular-nums">
                    {globalSummary.attendancePercent ?? "—"}%
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[var(--radius-inner)] border border-border bg-card shadow-none">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Гравців із відмітками</div>
                  <div className="text-2xl font-semibold tabular-nums">{uniquePlayers}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[var(--radius-section)] border border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Кількість тренувань за типом</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {typeSummaries.map((t) => {
                const Icon = typeIcons[t.type];
                return (
                  <div key={t.type} className="flex items-center justify-between rounded-[var(--radius-inner)] border border-border bg-card/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{typeLabels[t.type]}</div>
                        <div className="text-xs text-muted-foreground">Кількість: {t.trainingsCount}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {t.attendancePercent ?? "—"}%
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-[var(--radius-section)] border border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Присутність по гравцях</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[60px] text-xs">#</TableHead>
                    <TableHead className="text-xs">Гравець</TableHead>
                    <TableHead className="text-right text-xs">Було тренувань</TableHead>
                    <TableHead className="text-right text-xs">Присутній</TableHead>
                    <TableHead className="text-right text-xs">Відсутній</TableHead>
                    <TableHead className="text-right text-xs">Травма</TableHead>
                    <TableHead className="text-right text-xs">Хворий</TableHead>
                    <TableHead className="text-right text-xs">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerRows.map((row, idx) => {
                    const initials =
                      `${row.name.replace(/^#\d+\s/, "").split(" ").map((p) => p[0]).join("")}` || "•";
                    const positionLabel = row.position
                      ? positionUkMap[row.position.toLowerCase()] || row.position
                      : null;

                    return (
                      <TableRow
                        key={row.playerId}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => navigate(`/players/${row.playerId}`)}
                      >
                        <TableCell className="text-muted-foreground">#{row.shirtNumber ?? idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border">
                              <AvatarImage src={row.photoUrl || undefined} className="object-cover" />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-foreground">{row.name.replace(/^#\d+\s/, "")}</div>
                              {positionLabel && (
                                <div className="text-xs text-muted-foreground">{positionLabel}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {statPill(row.trainingsTracked, "text-foreground")}
                        </TableCell>
                        <TableCell className="text-right">
                          {statPill(row.presentCount, "text-emerald-500")}
                        </TableCell>
                        <TableCell className="text-right">
                          {statPill(row.absentCount, "text-rose-500")}
                        </TableCell>
                        <TableCell className="text-right">
                          {statPill(row.injuredCount, "text-amber-500")}
                        </TableCell>
                        <TableCell className="text-right">
                          {statPill(row.sickCount, "text-sky-500")}
                        </TableCell>
                        <TableCell className="text-right">
                          {statPill(
                            row.attendancePercent === null ? "—" : `${row.attendancePercent}%`,
                            "text-indigo-500",
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-[var(--radius-section)] border border-border bg-card shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Найстабільніші гравці
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {stableTop.length === 0 ? (
                  <p className="text-muted-foreground">Недостатньо даних для рейтингу.</p>
                ) : (
                  stableTop.map((r) => (
                    <div key={r.playerId} className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{r.name}</span>
                      <span className="text-muted-foreground">{r.attendancePercent}% • {r.trainingsTracked} тренувань</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[var(--radius-section)] border border-border bg-card shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <XCircle className="h-5 w-5 text-rose-500" />
                  Найбільше прогулів
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {absentTop.length === 0 ? (
                  <p className="text-muted-foreground">У цього періоду немає прогулів 👏.</p>
                ) : (
                  absentTop.map((r) => (
                    <div key={r.playerId} className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{r.name}</span>
                      <span className="text-muted-foreground">{r.absentCount} пропуски • {r.trainingsTracked} тренувань</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[var(--radius-section)] border border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HeartPulse className="h-5 w-5 text-amber-500" />
                Зведення статусів
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-[var(--radius-inner)] border border-border bg-card/60 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Присутні
                </div>
                <div className="mt-2 text-2xl font-semibold text-emerald-500 tabular-nums">{globalSummary.presentCount}</div>
              </div>
              <div className="rounded-[var(--radius-inner)] border border-border bg-card/60 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <XCircle className="h-4 w-4 text-rose-500" />
                  Відсутні
                </div>
                <div className="mt-2 text-2xl font-semibold text-rose-500 tabular-nums">{globalSummary.absentCount}</div>
              </div>
              <div className="rounded-[var(--radius-inner)] border border-border bg-card/60 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  Травми
                </div>
                <div className="mt-2 text-2xl font-semibold text-amber-500 tabular-nums">{globalSummary.injuredCount}</div>
              </div>
              <div className="rounded-[var(--radius-inner)] border border-border bg-card/60 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <HeartPulse className="h-4 w-4 text-sky-500" />
                  Хворі
                </div>
                <div className="mt-2 text-2xl font-semibold text-sky-500 tabular-nums">{globalSummary.sickCount}</div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

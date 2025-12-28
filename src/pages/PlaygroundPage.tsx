import * as React from "react";
import { supabase } from "@/lib/supabaseClient";
import { MatchCard, mapDbMatchToCardData } from "@/components/app/MatchCard";
import { Button } from "@/components/ui/button";

const TEAM_ID = "389719a7-5022-41da-bc49-11e7a3afbd98";
const TEAM_NAME = "FAYNA TEAM";

type MatchRow = {
  id: string;
  opponent_name: string;
  opponent_logo_url: string | null;
  match_date: string;
  status: "scheduled" | "played" | "canceled";
  score_team: number | null;
  score_opponent: number | null;
  home_away: "home" | "away" | "neutral";
  tournament_id: string | null;
  stage: string | null;
  matchday: number | null;
  tournaments:
    | {
        id: string;
        name: string;
        short_name: string | null;
        season: string | null;
        logo_url: string | null;
        league_name: string | null;
      }
    | null
    | Array<{
        id: string;
        name: string;
        short_name: string | null;
        season: string | null;
        logo_url: string | null;
        league_name: string | null;
      }>;
};

function normalizeLogoUrl(url: string | null | undefined) {
  if (!url) return null;
  return url.replace(/\/+$/, "");
}

export default function PlaygroundPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [matches, setMatches] = React.useState<MatchRow[]>([]);
  const [teamLogo, setTeamLogo] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    // 1) Матчі (ВАЖЛИВО: без season/location у matches)
    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        opponent_name,
        opponent_logo_url,
        match_date,
        status,
        score_team,
        score_opponent,
        home_away,
        tournament_id,
        stage,
        matchday,
        tournaments (
          id,
          name,
          short_name,
          season,
          logo_url,
          league_name
        )
      `
      )
      .eq("team_id", TEAM_ID)
      .order("match_date", { ascending: false })
      .limit(12);

    if (error) {
      setError(`Помилка Supabase: ${error.message}`);
      setLoading(false);
      return;
    }

    setMatches((data || []) as MatchRow[]);

    // 2) Лого нашої команди (teams -> clubs)
    const { data: teamData, error: teamErr } = await supabase
      .from("teams")
      .select("club_id")
      .eq("id", TEAM_ID)
      .single();

    if (!teamErr && teamData?.club_id) {
      const { data: clubData, error: clubErr } = await supabase
        .from("clubs")
        .select("logo_url")
        .eq("id", teamData.club_id)
        .single();

      if (!clubErr) {
        setTeamLogo(normalizeLogoUrl((clubData as any)?.logo_url ?? null));
      }
    }

    setLoading(false);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const cards = React.useMemo(() => {
    return matches.map((m) =>
      mapDbMatchToCardData({
        match: m,
        teamName: TEAM_NAME,
        teamLogo,
      })
    );
  }, [matches, teamLogo]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">UI Playground</h1>
          <p className="text-sm text-muted-foreground">
            Тут тестуємо компоненти на реальних даних з БД.
          </p>
        </div>

        <Button onClick={load} disabled={loading} variant="outline" className="rounded-xl">
          {loading ? "Завантажую…" : "Оновити"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="text-red-600 font-semibold">{error}</div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <MatchCard key={c.id} data={c} />
        ))}
      </div>
    </div>
  );
}

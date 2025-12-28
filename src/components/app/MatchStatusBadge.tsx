import { Badge } from "@/components/ui/badge";

export type MatchStatus = "scheduled" | "played" | "canceled";
type MatchOutcome = "win" | "loss" | "draw" | "none";

export function getOutcome(
  scoreTeam: number | null,
  scoreOpponent: number | null,
  status: MatchStatus
): MatchOutcome {
  if (status !== "played") return "none";
  if (scoreTeam === null || scoreOpponent === null) return "none";
  if (scoreTeam > scoreOpponent) return "win";
  if (scoreTeam < scoreOpponent) return "loss";
  return "draw";
}

export function getStatusText(
  status: MatchStatus,
  scoreTeam: number | null,
  scoreOpponent: number | null
): string {
  if (status === "scheduled") return "ЗАПЛАНОВАНИЙ";
  if (status === "canceled") return "СКАСОВАНИЙ";

  const outcome = getOutcome(scoreTeam, scoreOpponent, status);
  if (outcome === "win") return "ВИГРАЛИ";
  if (outcome === "loss") return "ПРОГРАЛИ";
  if (outcome === "draw") return "НІЧИЯ";

  return "ЗІГРАНИЙ";
}

export function getStatusTone(
  status: MatchStatus,
  scoreTeam: number | null,
  scoreOpponent: number | null
):
  | "neutral"
  | "info"
  | "success"
  | "danger"
  | "destructive" {
  if (status === "scheduled") return "info";
  if (status === "canceled") return "destructive";

  const outcome = getOutcome(scoreTeam, scoreOpponent, status);
  if (outcome === "win") return "success";
  if (outcome === "loss") return "danger";
  if (outcome === "draw") return "neutral";

  return "neutral";
}

export function MatchStatusBadge({
  status,
  scoreTeam,
  scoreOpponent,
}: {
  status: MatchStatus;
  scoreTeam: number | null;
  scoreOpponent: number | null;
}) {
  return (
    <Badge
      tone={getStatusTone(status, scoreTeam, scoreOpponent)}
      pill
      size="sm"
    >
      {getStatusText(status, scoreTeam, scoreOpponent)}
    </Badge>
  );
}

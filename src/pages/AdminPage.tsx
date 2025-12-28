import {
  Alert,
  Button,
  Container,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  TextInput,
  Title,
  Text,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MatchAttendanceSection } from '../features/matches/MatchAttendanceSection';

const TEAM_ID = '389719a7-5022-41da-bc49-11e7a3afbd98';

type MatchStatus = 'scheduled' | 'played' | 'canceled';
type HomeAway = 'home' | 'away' | 'neutral';

type Tournament = {
  id: string;
  club_id: string | null;
  name: string;
  short_name: string | null;
  season: string;
  league_name: string | null;
  age_group: string | null;
  external_url: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  created_at: string;
};

type TeamTournament = {
  id: string;
  team_id: string;
  tournament_id: string;
  is_primary: boolean;
  created_at: string;
  tournament: Tournament;
};

type Match = {
  id: string;
  team_id: string;
  opponent_name: string;
  match_date: string;
  home_away: HomeAway;
  status: MatchStatus;
  score_team: number | null;
  score_opponent: number | null;
  tournament_id: string | null;
  stage: string | null;
  matchday: number | null;
};

type FormState = {
  opponentName: string;
  dateTime: string;
  homeAway: HomeAway;
  status: MatchStatus;
  scoreOpponent: string;
  tournamentId: string;
  stage: string;
  matchday: string;
};

const statusLabels: Record<MatchStatus, string> = {
  scheduled: 'Запланований',
  played: 'Зіграний',
  canceled: 'Скасований',
};

export function AdminPage() {
  const [form, setForm] = useState<FormState>({
    opponentName: '',
    dateTime: '',
    homeAway: 'home',
    status: 'scheduled',
    scoreOpponent: '',
    tournamentId: '',
    stage: '',
    matchday: '',
  });

  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [teamTournaments, setTeamTournaments] = useState<TeamTournament[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function loadMatches() {
    setLoadingMatches(true);
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('team_id', TEAM_ID)
      .order('match_date', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setMatches((data || []) as Match[]);
    }
    setLoadingMatches(false);
  }

  async function loadTeamTournaments() {
    const { data, error } = await supabase
      .from('team_tournaments')
      .select('id, team_id, tournament_id, is_primary, created_at, tournaments(*)')
      .eq('team_id', TEAM_ID);

    if (error) {
      console.error('Помилка завантаження турнірів', error);
      return;
    }

    const rows = (data || []) as any[];
    const mapped: TeamTournament[] = rows
      .filter((row) => row.tournaments)
      .map((row) => ({
        id: row.id,
        team_id: row.team_id,
        tournament_id: row.tournament_id,
        is_primary: row.is_primary,
        created_at: row.created_at,
        tournament: row.tournaments as Tournament,
      }));

    mapped.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      if (a.tournament.season !== b.tournament.season) {
        return b.tournament.season.localeCompare(a.tournament.season);
      }
      return a.tournament.name.localeCompare(b.tournament.name);
    });

    setTeamTournaments(mapped);
  }

  useEffect(() => {
    loadMatches();
    loadTeamTournaments();
  }, []);

  function resetForm() {
    setForm({
      opponentName: '',
      dateTime: '',
      homeAway: 'home',
      status: 'scheduled',
      scoreOpponent: '',
      tournamentId: '',
      stage: '',
      matchday: '',
    });
    setMode('create');
    setEditingId(null);
  }

  function fillFormFromMatch(match: Match) {
    const date = new Date(match.match_date);
    const isoLocal = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);

    setForm({
      opponentName: match.opponent_name,
      dateTime: isoLocal,
      homeAway: match.home_away,
      status: match.status,
      scoreOpponent:
        match.score_opponent !== null ? String(match.score_opponent) : '',
      tournamentId: match.tournament_id || '',
      stage: match.stage || '',
      matchday: match.matchday !== null ? String(match.matchday) : '',
    });
    setMode('edit');
    setEditingId(match.id);
    setSuccess(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.opponentName.trim()) {
      setError('Потрібно вказати назву суперника');
      return;
    }

    if (!form.dateTime) {
      setError('Потрібно вказати дату та час');
      return;
    }

    const matchDate = new Date(form.dateTime);
    if (isNaN(matchDate.getTime())) {
      setError('Некоректна дата');
      return;
    }

    const scoreOpponent =
      form.scoreOpponent.trim() === '' ? null : Number(form.scoreOpponent);

    if (form.status === 'played' && scoreOpponent === null) {
      setError('Для зіграного матчу потрібно ввести рахунок суперника');
      return;
    }

    const tournamentIdToSave = form.tournamentId || null;
    const stageToSave = form.stage.trim() || null;
    const matchdayNumber =
      form.matchday.trim() === '' ? null : Number(form.matchday.trim());
    if (matchdayNumber !== null && Number.isNaN(matchdayNumber)) {
      setError('Тур має бути числом');
      return;
    }

    setSaving(true);

    if (mode === 'create') {
      const { error } = await supabase.from('matches').insert({
        team_id: TEAM_ID,
        opponent_name: form.opponentName.trim(),
        match_date: matchDate.toISOString(),
        home_away: form.homeAway,
        status: form.status,
        score_team: 0,
        score_opponent: scoreOpponent,
        tournament_id: tournamentIdToSave,
        stage: stageToSave,
        matchday: matchdayNumber,
      });

      setSaving(false);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess('Матч створено');
      resetForm();
      loadMatches();
    } else if (mode === 'edit' && editingId) {
      const { error } = await supabase
        .from('matches')
        .update({
          opponent_name: form.opponentName.trim(),
          match_date: matchDate.toISOString(),
          home_away: form.homeAway,
          status: form.status,
          score_opponent: scoreOpponent,
          tournament_id: tournamentIdToSave,
          stage: stageToSave,
          matchday: matchdayNumber,
        })
        .eq('id', editingId);

      setSaving(false);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess('Матч оновлено');
      resetForm();
      loadMatches();
    } else {
      setSaving(false);
      setError('Невідомий режим');
    }
  }

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm('Видалити цей матч?');
    if (!confirmDelete) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.from('matches').delete().eq('id', id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === 'edit' && editingId === id) {
      resetForm();
    }

    setSuccess('Матч видалено');
    loadMatches();
  }

  const tournamentOptions = teamTournaments;

  return (
    <Container size="lg">
      <Title order={2} mb="md">
        {mode === 'create' ? 'Адмінка – створення матчу' : 'Адмінка – редагування матчу'}
      </Title>

      <Stack gap="sm">
        {error && (
          <Alert color="red" variant="light" radius="md">
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="teal" variant="light" radius="md">
            {success}
          </Alert>
        )}

        <Paper withBorder shadow="sm" radius="md" p="md">
          <Stack gap="sm" component="form" onSubmit={handleSubmit}>
            <TextInput
              label="Суперник"
              placeholder="Наприклад, AFK Kateter"
              value={form.opponentName}
              onChange={(e) => updateForm('opponentName', e.currentTarget.value)}
            />

            <TextInput
              label="Дата та час"
              type="datetime-local"
              value={form.dateTime}
              onChange={(e) => updateForm('dateTime', e.currentTarget.value)}
            />

            <Select
              label="Поле"
              data={[
                { value: 'home', label: 'Вдома' },
                { value: 'away', label: 'Виїзд' },
              ]}
              value={form.homeAway}
              onChange={(value) => updateForm('homeAway', value as HomeAway)}
            />

            <Select
              label="Статус"
              data={[
                { value: 'scheduled', label: 'Запланований' },
                { value: 'played', label: 'Зіграний' },
              ]}
              value={form.status}
              onChange={(value) => updateForm('status', value as MatchStatus)}
            />

            <Select
              label="Турнір"
              data={[
                { value: '', label: 'Без турніру' },
                ...tournamentOptions.map((tt) => ({
                  value: tt.tournament_id,
                  label: `${tt.tournament.name} (${tt.tournament.season})${
                    tt.is_primary ? ' • основний' : ''
                  }`,
                })),
              ]}
              value={form.tournamentId}
              onChange={(value) => updateForm('tournamentId', value || '')}
              searchable
              clearable
            />

            <Group grow>
              <TextInput
                label="Стадія"
                placeholder="Регулярний чемпіонат"
                value={form.stage}
                onChange={(e) => updateForm('stage', e.currentTarget.value)}
              />
              <NumberInput
                label="Тур"
                placeholder="1"
                min={0}
                value={form.matchday === '' ? undefined : Number(form.matchday)}
                onChange={(value) => updateForm('matchday', value ? String(value) : '')}
              />
            </Group>

            <Group grow>
              <NumberInput
                label="Рахунок суперника"
                min={0}
                value={form.scoreOpponent === '' ? undefined : Number(form.scoreOpponent)}
                onChange={(value) => updateForm('scoreOpponent', value ? String(value) : '')}
              />
              <TextInput
                label="Наш рахунок (авто)"
                readOnly
                value={
                  mode === 'edit'
                    ? String(matches.find((m) => m.id === editingId)?.score_team ?? '—')
                    : '—'
                }
              />
            </Group>

            <Group gap="sm">
              <Button type="submit" disabled={saving}>
                {saving
                  ? mode === 'create'
                    ? 'Збереження…'
                    : 'Оновлення…'
                  : mode === 'create'
                  ? 'Створити матч'
                  : 'Зберегти зміни'}
              </Button>
              {mode === 'edit' && (
                <Button variant="subtle" onClick={resetForm} disabled={saving}>
                  Скасувати редагування
                </Button>
              )}
            </Group>
          </Stack>
        </Paper>

      {mode === 'edit' && editingId && (
        <MatchAttendanceSection matchId={editingId} />
      )}

      <Paper withBorder shadow="sm" radius="md" p="md">
        <Title order={3} mb="sm">
          Список матчів
        </Title>
        {loadingMatches ? (
          <Text>Завантаження матчів…</Text>
        ) : matches.length === 0 ? (
          <Text>Ще немає матчів.</Text>
        ) : (
          <Table highlightOnHover withRowBorders={false} striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Дата</Table.Th>
                <Table.Th>Суперник</Table.Th>
                <Table.Th>Статус</Table.Th>
                <Table.Th ta="center">Рахунок</Table.Th>
                <Table.Th ta="right">Дії</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {matches.map((m) => {
                const date = new Date(m.match_date);
                const score =
                  m.score_team !== null && m.score_opponent !== null
                    ? `${m.score_team} : ${m.score_opponent}`
                    : '— : —';

                const statusLabel = statusLabels[m.status];

                return (
                  <Table.Tr key={m.id}>
                    <Table.Td>{date.toLocaleString()}</Table.Td>
                    <Table.Td>{m.opponent_name}</Table.Td>
                    <Table.Td>{statusLabel}</Table.Td>
                    <Table.Td ta="center">{score}</Table.Td>
                    <Table.Td ta="right">
                      <Group gap="xs" justify="flex-end">
                        <Button size="xs" variant="subtle" onClick={() => fillFormFromMatch(m)}>
                          Редагувати
                        </Button>
                        <Button
                          size="xs"
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(m.id)}
                        >
                          Видалити
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          component={Link}
                          to={`/admin/matches/${m.id}/events`}
                        >
                          Події
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
      </Stack>
    </Container>
  );
}

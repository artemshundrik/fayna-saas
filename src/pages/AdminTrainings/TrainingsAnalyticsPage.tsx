import {
  Alert,
  Avatar,
  Button,
  Group,
  Loader,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { getTrainings } from '../../api/trainings';
import type { AttendanceStatus, Training } from '../../types/trainings';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const TEAM_ID = '389719a7-5022-41da-bc49-11e7a3afbd98';

type TrainingType = 'regular' | 'sparring';

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

type GlobalAttendanceSummary = {
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

const statusLabels: Record<AttendanceStatus, string> = {
  present: 'Присутній',
  absent: 'Відсутній',
  injured: 'Травма',
  sick: 'Хворий',
};

const typeLabels: Record<TrainingType, string> = {
  regular: 'Звичайне тренування',
  sparring: 'Спаринг',
};

const typeIcons: Record<TrainingType, string> = {
  regular: '🏃',
  sparring: '⚔️',
};

function round1(val: number) {
  return Math.round(val * 10) / 10;
}

const positionUkMap: Record<string, string> = {
  gk: 'Воротар',
  goalkeeper: 'Воротар',
  df: 'Захисник',
  cb: 'Центр. захисник',
  lb: 'Лівий захисник',
  rb: 'Правий захисник',
  mf: 'Півзахисник',
  cm: 'Центр. півзахисник',
  dm: 'Опорний півзахисник',
  am: 'Атак. півзахисник',
  fw: 'Нападник',
  st: 'Нападник',
  cf: 'Центр. форвард',
  lf: 'Лівий форвард',
  rf: 'Правий форвард',
  wing: 'Фланговий',
  universal: 'Універсал',
  univ: 'Універсал',
};

export function TrainingsAnalyticsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [trainingsData, attendanceRes, playersRes] = await Promise.all([
          getTrainings(TEAM_ID),
          supabase.from('training_attendance').select('training_id, player_id, status, created_at'),
          supabase
            .from('players')
            .select('id, first_name, last_name, shirt_number, position, photo_url')
            .eq('team_id', TEAM_ID),
        ]);
        if (attendanceRes.error) throw attendanceRes.error;
        if (playersRes.error) throw playersRes.error;
        setTrainings(trainingsData);
        setAttendance((attendanceRes.data || []) as AttendanceRow[]);
        setPlayers((playersRes.data || []) as Player[]);
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Не вдалося завантажити аналітику');
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
      (t) => new Date(`${t.date}T${t.time || '00:00'}`).getTime() <= now,
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
      { type: 'regular', trainingsCount: 0, presentCount: 0, absentCount: 0, attendancePercent: null },
      { type: 'sparring', trainingsCount: 0, presentCount: 0, absentCount: 0, attendancePercent: null },
    ];
    const byTraining = new Map<string, TrainingType>();
    completedTrainings.forEach((t) => {
      if (t.type === 'regular' || t.type === 'sparring') {
        summaries[t.type === 'regular' ? 0 : 1].trainingsCount += 1;
        byTraining.set(t.id, t.type);
      }
    });
    dedupAttendance.forEach((row) => {
      const tType = byTraining.get(row.training_id);
      if (!tType) return;
      const idx = tType === 'regular' ? 0 : 1;
      if (row.status === 'present') summaries[idx].presentCount += 1;
      if (row.status === 'absent') summaries[idx].absentCount += 1;
    });
    summaries.forEach((s) => {
      const denom = s.presentCount + s.absentCount;
      s.attendancePercent = denom === 0 ? null : round1((s.presentCount / denom) * 100);
    });
    return summaries;
  }, [completedTrainings, dedupAttendance]);

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
      if (row.status === 'present') entry.presentCount += 1;
      if (row.status === 'absent') entry.absentCount += 1;
      if (row.status === 'injured') entry.injuredCount += 1;
      if (row.status === 'sick') entry.sickCount += 1;
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
    const filtered = playerRows
      .filter((r) => r.trainingsTracked >= 3)
      .sort((a, b) => {
        if (b.absentCount !== a.absentCount) return b.absentCount - a.absentCount;
        return b.trainingsTracked - a.trainingsTracked;
      })
      .filter((r) => r.absentCount > 0)
      .slice(0, 3);
    return filtered;
  }, [playerRows]);

  const applyPreset = (preset: 'thisMonth' | 'lastMonth' | 'thisWeek' | 'thisYear') => {
    const today = new Date();
    if (preset === 'thisMonth') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setFromDate(start.toISOString().slice(0, 10));
      setToDate(end.toISOString().slice(0, 10));
    }
    if (preset === 'lastMonth') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setFromDate(start.toISOString().slice(0, 10));
      setToDate(end.toISOString().slice(0, 10));
    }
    if (preset === 'thisWeek') {
      const day = today.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setFromDate(monday.toISOString().slice(0, 10));
      setToDate(sunday.toISOString().slice(0, 10));
    }
    if (preset === 'thisYear') {
      setFromDate(`${today.getFullYear()}-01-01`);
      setToDate(`${today.getFullYear()}-12-31`);
    }
  };

  if (loading) {
    return (
      <Group>
        <Loader size="sm" />
        <Text>Завантаження…</Text>
      </Group>
    );
  }

  if (error) {
    return (
      <Alert color="red" variant="light" title="Помилка">
        {error}
      </Alert>
    );
  }

  const hasTrainings = filteredTrainings.length > 0;

  return (
    <Stack gap="lg">
      <Title order={2}>Аналітика тренувань</Title>

      <Paper withBorder shadow="xs" radius="md" p="md">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
          <Stack gap={4} style={{ minWidth: 240 }}>
            <Text size="sm" fw={600}>
              Період
            </Text>
            <Group gap="sm" wrap="wrap">
              <TextInput
                type="date"
                label="Початок"
                value={fromDate}
                onChange={(e) => setFromDate(e.currentTarget.value)}
              />
              <TextInput
                type="date"
                label="Кінець"
                value={toDate}
                onChange={(e) => setToDate(e.currentTarget.value)}
              />
            </Group>
          </Stack>
          <Group gap="sm" wrap="wrap">
            <Button variant="light" onClick={() => applyPreset('thisWeek')}>
              Цей тиждень
            </Button>
            <Button variant="light" onClick={() => applyPreset('thisMonth')}>
              Цей місяць
            </Button>
            <Button variant="light" onClick={() => applyPreset('lastMonth')}>
              Минулий місяць
            </Button>
            <Button variant="light" onClick={() => applyPreset('thisYear')}>
              Цей рік
            </Button>
          </Group>
        </Group>
      </Paper>

      {!hasTrainings ? (
        <Paper withBorder shadow="xs" radius="md" p="md">
          <Stack gap={4}>
            <Title order={4} m={0}>
              Немає тренувань у вибраному періоді
            </Title>
            <Text c="dimmed">Змініть діапазон дат або створіть нове тренування.</Text>
          </Stack>
        </Paper>
      ) : (
        <>
          <Paper withBorder shadow="xs" radius="md" p="md">
            <Title order={4} m={0}>
              Кількість тренувань за типом
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="sm">
              {typeSummaries.map((t) => (
                <Paper key={t.type} withBorder shadow="xs" radius="md" p="sm">
                  <Stack gap={4}>
                    <Group gap={6}>
                      <Text>{typeIcons[t.type]}</Text>
                      <Text size="sm" c="dimmed">
                        {typeLabels[t.type]}
                      </Text>
                    </Group>
                    <Text size="sm">Кількість: {t.trainingsCount}</Text>
                    <Text size="sm">Відвідуваність: {t.attendancePercent ?? '—'}%</Text>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>

                    <Paper withBorder shadow="xs" radius="md" p="md" style={{ overflow: 'hidden' }}>
            <Title order={4} m={0}>
              Присутність по гравцях
            </Title>
            <ScrollArea
              offsetScrollbars
              mt="sm"
              style={{ marginLeft: -16, marginRight: -16 }}
            >
                            <Table
                highlightOnHover
                withColumnBorders={false}
                withRowBorders
                style={{
                  width: '100%',
                  '--table-border-color': '#e5e7eb',
                  '--table-row-hover-background': '#f2f4f7',
                }}
                styles={{
                  th: { padding: '12px 16px' },
                  td: { padding: '14px 16px' },
                  tr: { cursor: 'pointer' },
                  tbody: {
                    '& tr:last-of-type td': {
                      borderBottom: 'none',
                    },
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 70 }}>#</Table.Th>
                    <Table.Th style={{ paddingLeft: 0 }}>Гравець</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Було тренувань</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Присутній</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Відсутній</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Травма</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Хворий</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>%</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {playerRows.map((row, idx) => {
                    const initials =
                      `${row.name.replace(/^#\d+\s/, '').split(' ').map((p) => p[0]).join('')}` || '•';
                    const positionLabel = row.position
                      ? positionUkMap[row.position.toLowerCase()] || row.position
                      : null;
                    const statPill = (value: string | number, color: string) => (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          minWidth: 68,
                          fontWeight: 700,
                          color,
                        }}
                      >
                        {value}
                      </div>
                    );
                    return (
                      <Table.Tr
                        key={row.playerId}
                        onClick={() => navigate(`/players/${row.playerId}`)}
                      >
                        <Table.Td>
                          <Text fw={700} c="dimmed">
                            #{row.shirtNumber ?? idx + 1}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ paddingLeft: 0 }}>
                          <Group gap="sm" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Avatar
                              radius="xl"
                              color="blue"
                              variant="light"
                              src={row.photoUrl || undefined}
                              styles={{
                                root: {
                                  alignSelf: 'flex-end',
                                  marginTop: 6,
                                  border: row.photoUrl ? '1px solid #e5e7eb' : undefined,
                                },
                                image: {
                                  objectPosition: 'top center',
                                  transform: 'scale(1.6) translateY(18%)',
                                },
                              }}
                            >
                              {initials}
                            </Avatar>
                            <Stack gap={2} justify="center">
                              <Text fw={700}>{row.name.replace(/^#\d+\s/, '')}</Text>
                              {positionLabel && (
                                <Text
                                  size="xs"
                                  c="dimmed"
                                  fw={
                                    positionLabel === 'Воротар' || positionLabel === 'Універсал'
                                      ? 700
                                      : 500
                                  }
                                >
                                  {positionLabel}
                                </Text>
                              )}
                            </Stack>
                          </Group>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {statPill(row.trainingsTracked, '#0f172a')}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {statPill(row.presentCount, '#10B981')}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {statPill(row.absentCount, '#EF4444')}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {statPill(row.injuredCount, '#F59E0B')}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {statPill(row.sickCount, '#3B82F6')}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          {statPill(
                            row.attendancePercent === null ? '—' : `${row.attendancePercent}%`,
                            '#7c3aed',
                          )}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>

            </ScrollArea>
          </Paper>


          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Paper withBorder shadow="xs" radius="md" p="md">
              <Title order={5} m={0}>
                Найстабільніші гравці
              </Title>
              <Stack gap={6} mt="sm">
                {stableTop.length === 0 ? (
                  <Text c="dimmed">Недостатньо даних для рейтингу.</Text>
                ) : (
                  stableTop.map((r) => (
                    <Text key={r.playerId} size="sm">
                      • {r.name} — {r.attendancePercent}% ({r.trainingsTracked} тренувань)
                    </Text>
                  ))
                )}
              </Stack>
            </Paper>

            <Paper withBorder shadow="xs" radius="md" p="md">
              <Title order={5} m={0}>
                Найбільше прогулів
              </Title>
              <Stack gap={6} mt="sm">
                {absentTop.length === 0 ? (
                  <Text c="dimmed">У цього періоду немає прогулів 👏.</Text>
                ) : (
                  absentTop.map((r) => (
                    <Text key={r.playerId} size="sm">
                      • {r.name} — {r.absentCount} пропуски ({r.trainingsTracked} тренувань)
                    </Text>
                  ))
                )}
              </Stack>
            </Paper>
          </SimpleGrid>
        </>
      )}
    </Stack>
  );
}

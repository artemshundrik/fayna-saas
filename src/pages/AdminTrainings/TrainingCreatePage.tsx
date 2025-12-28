import { Button, Paper, Select, Stack, Textarea, Text, TextInput, Title, Group } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { createTraining, getLastTrainingForTeam } from '../../api/trainings';
import type { Training } from '../../types/trainings';

const TEAM_ID = '389719a7-5022-41da-bc49-11e7a3afbd98';

export function TrainingCreatePage() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'regular' | 'tactics' | 'fitness' | 'sparring'>('regular');
  const [location, setLocation] = useState('');
  const [sparringOpponent, setSparringOpponent] = useState('');
  const [sparringLogo, setSparringLogo] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { prefillFromTraining?: Partial<Training> } };

  const typeOptions = [
    { value: 'regular', label: 'Звичайне' },
    { value: 'tactics', label: 'Тактичне' },
    { value: 'fitness', label: 'Фізпідготовка' },
    { value: 'sparring', label: 'Спаринг' },
  ];

  useEffect(() => {
    const prefill = state?.prefillFromTraining;
      if (prefill) {
        if (prefill.time) setTime(prefill.time);
        if (prefill.type) setType(prefill.type as typeof type);
        if (prefill.location) setLocation(prefill.location || '');
        if (prefill.sparring_opponent) setSparringOpponent(prefill.sparring_opponent || '');
        if (prefill.sparring_logo_url) setSparringLogo(prefill.sparring_logo_url || '');
        if (prefill.comment) setComment(prefill.comment || '');
        const baseDate = prefill.date ? new Date(prefill.date) : new Date();
        const nextDate = prefill.date
          ? new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
          : new Date();
        const iso = nextDate.toISOString().slice(0, 10);
        setDate(iso);
        setInfo('Форма заповнена на основі попереднього тренування');
      } else {
        setDate(new Date().toISOString().slice(0, 10));
      }
  }, [state]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!date || !time) {
      setError('Вкажіть дату та час');
      return;
    }
    try {
      setSaving(true);
      await createTraining({
        team_id: TEAM_ID,
        date,
        time,
        type,
        sparring_opponent: type === 'sparring' ? sparringOpponent.trim() || null : null,
        sparring_logo_url: type === 'sparring' ? sparringLogo.trim() || null : null,
        location: location.trim() || null,
        comment: comment.trim() || undefined,
      });
      navigate('/admin/trainings');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Не вдалося створити тренування');
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyLast() {
    setError(null);
    setInfo(null);
    setCopying(true);
    try {
      const last = await getLastTrainingForTeam(TEAM_ID);
      if (!last) {
        setInfo('Немає попередніх тренувань для копіювання.');
      } else {
        setTime(last.time);
        setType(last.type);
        setLocation(last.location || '');
        setSparringOpponent(last.sparring_opponent || '');
        setSparringLogo(last.sparring_logo_url || '');
        setComment(last.comment || '');
        setDate(new Date().toISOString().slice(0, 10));
        setInfo('Заповнено з останнього тренування');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Не вдалося отримати останнє тренування');
    } finally {
      setCopying(false);
    }
  }

  return (
    <Paper withBorder shadow="xs" radius="md" p="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Title order={3}>Створити тренування</Title>
          <Group gap="sm">
            <Button variant="light" onClick={handleCopyLast} loading={copying}>
              Скопіювати останнє тренування
            </Button>
            {info && <Text size="sm">{info}</Text>}
          </Group>
          <TextInput label="Дата" type="date" value={date} onChange={(e) => setDate(e.currentTarget.value)} required />
          <TextInput label="Час" type="time" value={time} onChange={(e) => setTime(e.currentTarget.value)} required />
          <Select
            label="Тип"
            data={typeOptions}
            value={type}
            onChange={(val) => setType((val as typeof type) || 'regular')}
            required
          />
          {type === 'sparring' && (
            <TextInput
              label="Суперник (спаринг)"
              placeholder="Назва команди"
              value={sparringOpponent}
              onChange={(e) => setSparringOpponent(e.currentTarget.value)}
            />
          )}
          {type === 'sparring' && (
            <TextInput
              label="Логотип суперника (URL)"
              placeholder="https://…"
              value={sparringLogo}
              onChange={(e) => setSparringLogo(e.currentTarget.value)}
            />
          )}
          <TextInput
            label="Місце проведення"
            placeholder="Адреса або зал"
            value={location}
            onChange={(e) => setLocation(e.currentTarget.value)}
          />
          <Textarea
            label="Коментар"
            placeholder="Додаткові нотатки"
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
          />
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <Button type="submit" loading={saving}>
            Створити тренування
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}

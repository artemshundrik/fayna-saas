import { Button, Group } from '@mantine/core';
import type { AttendanceStatus } from '../../types/trainings';

type Props = {
  value: AttendanceStatus;
  onChange: (newStatus: AttendanceStatus) => void;
};

const options: { value: AttendanceStatus; label: string; color: string; icon: string }[] = [
  { value: 'present', label: 'Присутній', color: 'green', icon: '🟩' },
  { value: 'absent', label: 'Відсутній', color: 'red', icon: '🟥' },
  { value: 'injured', label: 'Травма', color: 'orange', icon: '🩹' },
  { value: 'sick', label: 'Хворий', color: 'blue', icon: '🤒' },
];

export function AttendanceStatusControl({ value, onChange }: Props) {
  return (
    <Group gap={6} wrap="wrap">
      {options.map((opt) => (
        <Button
          key={opt.value}
          size="xs"
          variant={value === opt.value ? 'filled' : 'light'}
          color={opt.color}
          onClick={() => onChange(opt.value)}
          radius="xl"
        >
          {opt.icon} {opt.label}
        </Button>
      ))}
    </Group>
  );
}

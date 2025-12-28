export type Training = {
  id: string;
  team_id: string;
  date: string;
  time: string;
  type: 'regular' | 'tactics' | 'fitness' | 'sparring';
  sparring_opponent?: string | null;
  sparring_logo_url?: string | null;
  location: string | null;
  comment?: string | null;
};

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'injured'
  | 'sick';

export type Attendance = {
  id: string;
  training_id: string;
  player_id: string;
  status: AttendanceStatus;
  comment?: string | null;
};

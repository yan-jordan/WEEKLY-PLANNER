export type BoardTask = {
  id: string;
  title: string;
  hours: number;
  complexity: number;
  day: number | null;
  done: boolean;
  actualHours: number | null;
};

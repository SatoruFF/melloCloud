export type Task = {
  id: string;
  text: string;
  columnId: string;
  createdAt: Date;
  priority?: "low" | "medium" | "high";
};

export type Column = {
  id: string;
  title: string;
  color: string;
  order: number;
};

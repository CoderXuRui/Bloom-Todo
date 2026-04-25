export type Priority = 'high' | 'medium' | 'low';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  deadline: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  subtasks: Subtask[];
  deletedAt: string | null;
  expanded: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Settings {
  lastUpdated: string;
}

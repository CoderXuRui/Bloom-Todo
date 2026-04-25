import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Task, Category } from '../types';

interface TaskStore {
  tasks: Task[];
  categories: Category[];

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'deletedAt' | 'completedAt' | 'expanded'>) => void;
  toggleTask: (id: string) => void;
  toggleExpanded: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  permanentDeleteTask: (id: string) => void;

  // Subtask actions
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Reorder
  reorderTasksByOrder: (orderedIds: string[]) => void;

  // Category actions
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

// 固定的默认分类ID，避免每次刷新不一致
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-work', name: '工作', color: '#FF8A8A' },
  { id: 'cat-study', name: '学习', color: '#B5DEFF' },
  { id: 'cat-life', name: '生活', color: '#A8E6CF' },
];

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      categories: DEFAULT_CATEGORIES,

      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              deletedAt: null,
              completedAt: null,
              expanded: false,
            },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, deletedAt: new Date().toISOString() } : task
          ),
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  completedAt: !task.completed ? new Date().toISOString() : null,
                }
              : task
          ),
        })),

      toggleExpanded: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, expanded: !task.expanded } : task
          ),
        })),

      restoreTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, deletedAt: null } : task
          ),
        })),

      permanentDeleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      reorderTasksByOrder: (orderedIds) =>
        set((state) => {
          const orderedSet = new Set(orderedIds);
          const orderedTasks = orderedIds
            .map((id) => state.tasks.find((t) => t.id === id))
            .filter(Boolean) as Task[];

          // 保持不可见任务的相对位置，将可见任务按新顺序插入它们原来的占位处
          const result: Task[] = [];
          let orderedIdx = 0;
          for (const task of state.tasks) {
            if (orderedSet.has(task.id)) {
              if (orderedIdx < orderedTasks.length) {
                result.push(orderedTasks[orderedIdx++]);
              }
            } else {
              result.push(task);
            }
          }
          return { tasks: result };
        }),

      addSubtask: (taskId, title) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [
                    ...task.subtasks,
                    { id: uuidv4(), title, completed: false },
                  ],
                }
              : task
          ),
        })),

      toggleSubtask: (taskId, subtaskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                  ),
                }
              : task
          ),
        })),

      deleteSubtask: (taskId, subtaskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
                }
              : task
          ),
        })),

      addCategory: (name, color) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: uuidv4(), name, color },
          ],
        })),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
          tasks: state.tasks.map((task) =>
            task.category === id ? { ...task, category: '' } : task
          ),
        })),
    }),
    {
      name: 'todo-storage',
      version: 3,
      partialize: (state) => ({
        tasks: state.tasks,
        categories: state.categories,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 确保所有task都有新字段
          state.tasks = state.tasks.map((task) => ({
            ...task,
            subtasks: task.subtasks || [],
            description: task.description || '',
            deletedAt: task.deletedAt ?? null,
            completedAt: task.completedAt ?? (task.completed ? new Date().toISOString() : null),
            expanded: task.expanded ?? false,
          }));
          // 确保有默认分类
          if (!state.categories || state.categories.length === 0) {
            state.categories = DEFAULT_CATEGORIES;
          }
        }
      },
    }
  )
);

import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Task, TaskTemplate} from '../types/Task';
import uuid from 'react-native-uuid';

interface TaskContextType {
  tasks: Task[];
  activeTask: Task | null;
  templates: TaskTemplate[];
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'timeSpent'>) => Promise<void>;
  startTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string, proof: any) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskTime: (taskId: string, timeSpent: number) => Promise<void>;
  getTaskById: (taskId: string) => Task | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [templates] = useState<TaskTemplate[]>([
    {
      id: '1',
      name: 'Gym Workout',
      description: 'Complete your daily workout routine',
      category: 'Health',
      estimatedDuration: 60,
      proofType: 'photo',
      requiresLocation: true,
      blockedApps: ['com.instagram.android', 'com.twitter.android', 'com.tiktok'],
    },
    {
      id: '2',
      name: 'Study Session',
      description: 'Focus on your studies without distractions',
      category: 'Education',
      estimatedDuration: 120,
      proofType: 'photo',
      requiresLocation: false,
      blockedApps: ['com.instagram.android', 'com.twitter.android', 'com.tiktok', 'com.youtube.android'],
    },
    {
      id: '3',
      name: 'Work Project',
      description: 'Complete assigned work tasks',
      category: 'Work',
      estimatedDuration: 180,
      proofType: 'document',
      requiresLocation: false,
      blockedApps: ['com.instagram.android', 'com.twitter.android', 'com.tiktok'],
    },
  ]);

  useEffect(() => {
    loadTasks();
    loadActiveTask();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          deadline: new Date(task.deadline),
          createdAt: new Date(task.createdAt),
          startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadActiveTask = async () => {
    try {
      const storedActiveTask = await AsyncStorage.getItem('activeTask');
      if (storedActiveTask) {
        const parsedTask = JSON.parse(storedActiveTask);
        setActiveTask({
          ...parsedTask,
          deadline: new Date(parsedTask.deadline),
          createdAt: new Date(parsedTask.createdAt),
          startedAt: parsedTask.startedAt ? new Date(parsedTask.startedAt) : undefined,
        });
      }
    } catch (error) {
      console.error('Error loading active task:', error);
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const saveActiveTask = async (task: Task | null) => {
    try {
      if (task) {
        await AsyncStorage.setItem('activeTask', JSON.stringify(task));
      } else {
        await AsyncStorage.removeItem('activeTask');
      }
      setActiveTask(task);
    } catch (error) {
      console.error('Error saving active task:', error);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'timeSpent'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuid.v4() as string,
      createdAt: new Date(),
      status: 'pending',
      timeSpent: 0,
    };

    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);
  };

  const startTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      status: 'active' as const,
      startedAt: new Date(),
    };

    const updatedTasks = tasks.map(t => t.id === taskId ? updatedTask : t);
    await saveTasks(updatedTasks);
    await saveActiveTask(updatedTask);
  };

  const completeTask = async (taskId: string, proof: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = {
      ...task,
      status: 'completed' as const,
      completedAt: new Date(),
      proofSubmitted: proof,
    };

    const updatedTasks = tasks.map(t => t.id === taskId ? updatedTask : t);
    await saveTasks(updatedTasks);
    await saveActiveTask(null);
  };

  const deleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    await saveTasks(updatedTasks);
  };

  const updateTaskTime = async (taskId: string, timeSpent: number) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? {...t, timeSpent} : t
    );
    await saveTasks(updatedTasks);

    if (activeTask && activeTask.id === taskId) {
      const updatedActiveTask = {...activeTask, timeSpent};
      setActiveTask(updatedActiveTask);
      await AsyncStorage.setItem('activeTask', JSON.stringify(updatedActiveTask));
    }
  };

  const getTaskById = (taskId: string) => {
    return tasks.find(t => t.id === taskId);
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      activeTask,
      templates,
      createTask,
      startTask,
      completeTask,
      deleteTask,
      updateTaskTime,
      getTaskById,
    }}>
      {children}
    </TaskContext.Provider>
  );
};
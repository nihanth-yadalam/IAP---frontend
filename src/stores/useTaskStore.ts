import { create } from 'zustand'
import { api } from '@/lib/api'

export type Task = {
    id: string
    category: "exam" | "assignment" | "extra"
    title: string
    description?: string | null
    deadline: string
    status: "pending" | "completed" | "dropped"
    priority: "low" | "medium" | "high"
    planned_start?: string | null
    planned_end?: string | null
}

interface TaskState {
    tasks: Task[]
    isLoading: boolean
    error: string | null
    fetchTasks: () => Promise<void>
    addTask: (task: Partial<Task>) => Promise<void>
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>
    deleteTask: (id: string) => Promise<void>
    completeTask: (id: string, feedback?: any) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async () => {
        set({ isLoading: true, error: null })
        try {
            const res = await api.get('/tasks')
            set({ tasks: res.data, isLoading: false })
        } catch (error: any) {
            set({ isLoading: false, error: error?.message || 'Failed to fetch tasks' })
        }
    },

    addTask: async (task) => {
        set({ isLoading: true, error: null })
        try {
            const res = await api.post('/tasks', task)
            set((state) => ({
                tasks: [...state.tasks, res.data],
                isLoading: false
            }))
        } catch (error: any) {
            set({ isLoading: false, error: error?.message || 'Failed to add task' })
            throw error
        }
    },

    updateTask: async (id, updates) => {
        // Optimistic update? Or wait? Let's wait for now to be safe.
        // API doesn't seem to have PUT /tasks/{id} implemented in the mock check earlier?
        // Re-checking api.ts:
        // It has GET /tasks, POST /tasks, POST /tasks/{id}/complete
        // It DOES NOT have generic UPDATE (PUT). 
        // User request says: "Tasks must support creation, viewing, editing, and deletion... needed to be implemented and fixed"
        // So I need to implement PUT /tasks/{id} and DELETE /tasks/{id} in API.ts first!
        set({ isLoading: true })
        try {
            // Placeholder for when API supports it
            await api.put(`/tasks/${id}`, updates)
            set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
                isLoading: false
            }))
        } catch (error: any) {
            set({ isLoading: false, error: error?.message || 'Failed to update task' })
            throw error
        }
    },

    deleteTask: async (id) => {
        set({ isLoading: true })
        try {
            await api.delete(`/tasks/${id}`)
            set((state) => ({
                tasks: state.tasks.filter(t => t.id !== id),
                isLoading: false
            }))
        } catch (error: any) {
            set({ isLoading: false, error: error?.message || 'Failed to delete task' })
            throw error
        }
    },

    completeTask: async (id, feedback) => {
        set({ isLoading: true })
        try {
            await api.post(`/tasks/${id}/complete`, feedback)
            set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, status: 'completed' } : t),
                isLoading: false
            }))
            // Refresh to be sure?
            get().fetchTasks()
        } catch (error: any) {
            set({ isLoading: false, error: error?.message || 'Failed to complete task' })
        }
    }
}))

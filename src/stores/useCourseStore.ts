import { create } from 'zustand'
import { api } from '@/lib/api'

export type Course = {
    id: string
    name: string
    code: string
    color: string // Hex color
    term?: string
}

interface CourseState {
    courses: Course[]
    isLoading: boolean
    error: string | null
    fetchCourses: () => Promise<void>
    addCourse: (course: Partial<Course>) => Promise<void>
    updateCourse: (id: string, updates: Partial<Course>) => Promise<void>
    deleteCourse: (id: string) => Promise<void>
}

export const useCourseStore = create<CourseState>((set, get) => ({
    courses: [],
    isLoading: false,
    error: null,

    fetchCourses: async () => {
        set({ isLoading: true, error: null })
        try {
            const res = await api.get('/courses')
            set({ courses: res.data, isLoading: false })
        } catch (error: any) {
            set({ isLoading: false, error: error?.message || 'Failed to fetch courses' })
        }
    },

    addCourse: async (course) => {
        set({ isLoading: true, error: null })
        try {
            const res = await api.post('/courses', course)
            set((state) => ({
                courses: [...state.courses, res.data],
                isLoading: false
            }))
        } catch (error: any) {
            set({ isLoading: false, error: error?.message || 'Failed to add course' })
            throw error
        }
    },

    updateCourse: async (id, updates) => {
        set({ isLoading: true })
        try {
            await api.put(`/courses/${id}`, updates)
            set((state) => ({
                courses: state.courses.map(c => c.id === id ? { ...c, ...updates } : c),
                isLoading: false
            }))
        } catch (error: any) {
            set({ isLoading: false, error: error?.message || 'Failed to update course' })
            throw error
        }
    },

    deleteCourse: async (id) => {
        set({ isLoading: true })
        try {
            await api.delete(`/courses/${id}`)
            set((state) => ({
                courses: state.courses.filter(c => c.id !== id),
                isLoading: false
            }))
        } catch (error: any) {
            set({ isLoading: false, error: error?.message || 'Failed to delete course' })
            throw error
        }
    }
}))

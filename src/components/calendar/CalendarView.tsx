import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Task } from '@/stores/useTaskStore'
import { useCourseStore } from '@/stores/useCourseStore'

const locales = { 'en-US': enUS }

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

interface CalendarViewProps {
    tasks: Task[]
    onSelectTask: (task: Task) => void
    onSelectSlot: (slotInfo: { start: Date; end: Date }) => void
}

// Pastel-harmonious event colors
// Vibrant harmonious event colors
const categoryColors: Record<string, { bg: string; border: string }> = {
    exam: { bg: 'hsl(var(--vibrant-pink))', border: 'hsl(var(--vibrant-pink))' },
    assignment: { bg: 'hsl(var(--vibrant-blue))', border: 'hsl(var(--vibrant-blue))' },
    extra: { bg: 'hsl(var(--vibrant-green))', border: 'hsl(var(--vibrant-green))' },
    default: { bg: 'hsl(var(--vibrant-purple))', border: 'hsl(var(--vibrant-purple))' },
}

export default function CalendarView({ tasks, onSelectTask, onSelectSlot }: CalendarViewProps) {
    const { courses } = useCourseStore()
    const [view, setView] = useState<View>(Views.WEEK)

    const events = useMemo(() => {
        return tasks
            .filter((t) => t.status !== 'dropped')
            .map((t) => {
                const start = t.planned_start
                    ? new Date(t.planned_start)
                    : new Date(new Date(t.deadline).getTime() - 60 * 60 * 1000)
                const end = t.planned_end ? new Date(t.planned_end) : new Date(t.deadline)

                return {
                    id: t.id,
                    title: t.title,
                    start,
                    end,
                    resource: t,
                }
            })
    }, [tasks])

    const eventStyleGetter = (event: any) => {
        const task = event.resource as Task
        const colors = categoryColors[task.category] || categoryColors.default
        const isCompleted = task.status === 'completed'

        return {
            style: {
                backgroundColor: colors.bg,
                border: 'none',
                borderRadius: '6px',
                opacity: isCompleted ? 0.6 : 0.9,
                color: '#fff',
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '2px 6px',
                boxShadow: isCompleted ? 'none' : `0 2px 4px ${colors.bg}40`,
                textDecoration: isCompleted ? 'line-through' : 'none',
            },
        }
    }

    return (
        <div className="h-[650px]">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                defaultView={Views.WEEK}
                view={view}
                onView={setView}
                step={30}
                timeslots={2}
                selectable
                onSelectEvent={(event) => onSelectTask(event.resource)}
                onSelectSlot={(slotInfo) => onSelectSlot(slotInfo)}
                eventPropGetter={eventStyleGetter}
                formats={{
                    timeGutterFormat: (date, culture, localizer) =>
                        localizer ? localizer.format(date, 'h a', culture!) : '',
                }}
            />
        </div>
    )
}

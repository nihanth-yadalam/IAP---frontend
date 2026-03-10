import { Task } from "@/stores/useTaskStore";
import { addMinutes, isBefore, isAfter, areIntervalsOverlapping } from "date-fns";

export interface FixedSlot {
    day_of_week: number;
    start_time?: string;
    end_time?: string;
    start_hour?: number;
    end_hour?: number;
}

/**
 * Checks if a proposed time block conflicts with existing scheduled tasks or fixed weekly slots.
 */
export function hasConflict(
    proposedStart: Date,
    proposedEnd: Date,
    existingTasks: Task[],
    fixedSlots: FixedSlot[] = []
): boolean {
    // 1. Check conflicts with existing scheduled tasks
    const tasksWithTime = existingTasks.filter(t => t.status === "pending" && t.planned_start && t.planned_end);
    
    for (const task of tasksWithTime) {
        const taskStart = new Date(task.planned_start!);
        const taskEnd = new Date(task.planned_end!);
        
        if (areIntervalsOverlapping(
            { start: proposedStart, end: proposedEnd },
            { start: taskStart, end: taskEnd }
        )) {
            return true;
        }
    }

    // 2. Check conflicts with fixed slots (classes, etc.)
    const proposedDayOfWeek = proposedStart.getDay() === 0 ? 6 : proposedStart.getDay() - 1; // Map Sun=0 to 6, Mon=1 to 0... wait, API uses Monday=0?
    // Let's assume day_of_week: 0=Monday, 1=Tuesday, ..., 6=Sunday.
    const dayConverter = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 } as const;
    const proposedDayMap = dayConverter[proposedStart.getDay() as keyof typeof dayConverter];
    
    const proposedStartHour = proposedStart.getHours() + (proposedStart.getMinutes() / 60);
    const proposedEndHour = proposedEnd.getHours() + (proposedEnd.getMinutes() / 60);

    for (const slot of fixedSlots) {
        if (slot.day_of_week === proposedDayMap || slot.day_of_week === proposedStart.getDay() /* handle both possible mappings based on the api.ts saving logic */) {
            let startH = slot.start_hour;
            let endH = slot.end_hour;
            
            // if string times are provided "08:00:00"
            if (slot.start_time && slot.end_time) {
                startH = parseInt(slot.start_time.split(":")[0], 10) + parseInt(slot.start_time.split(":")[1] || "0", 10)/60;
                endH = parseInt(slot.end_time.split(":")[0], 10) + parseInt(slot.end_time.split(":")[1] || "0", 10)/60;
            }

            if (startH !== undefined && endH !== undefined) {
                // If proposed time overlaps with fixed slot on the same day
                if ((proposedStartHour >= startH && proposedStartHour < endH) ||
                    (proposedEndHour > startH && proposedEndHour <= endH) ||
                    (proposedStartHour <= startH && proposedEndHour >= endH)) {
                    return true;
                }
            }
        }
    }

    return false;
}

/**
 * Ranks pending, unscheduled tasks (or tasks scheduled later) to suggest the best one to fill a gap.
 */
export function rankTasksForGap(
    gapMinutes: number,
    pendingTasks: Task[]
): Task | null {
    // We only want to pull forward tasks that:
    // 1. Have no planned_start OR are planned significantly in the future.
    // 2. Ideally don't exceed the gap size by too much, though if high priority we might still suggest it (and let it spill over).
    
    // For simplicity, we prioritize:
    // 1. High priority tasks
    // 2. Earliest deadline
    
    // Sort tasks
    const eligible = [...pendingTasks].filter(t => t.id).sort((a, b) => {
        // High priority first
        const pOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const pA = pOrder[a.priority] || 2;
        const pB = pOrder[b.priority] || 2;
        if (pA !== pB) return pB - pA; // Descending priority
        
        // Then Earliest Deadline
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    if (eligible.length > 0) {
        return eligible[0];
    }

    return null;
}

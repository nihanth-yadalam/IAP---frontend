import { useState, useEffect } from "react";
import { useCourseStore, Course } from "@/stores/useCourseStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, BookOpen, Palette } from "lucide-react";

const presetColors = [
    "#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4",
    "#14b8a6", "#10b981", "#f59e0b", "#f97316",
    "#ef4444", "#ec4899", "#a855f7", "#64748b",
];

export default function CoursesPage() {
    const { courses, fetchCourses, addCourse, updateCourse, deleteCourse, isLoading } = useCourseStore();
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [color, setColor] = useState("#8b5cf6");
    const [term, setTerm] = useState("");

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleOpenCreate = () => {
        setEditingCourse(null);
        setName(""); setCode(""); setColor("#8b5cf6"); setTerm("");
        setOpenDialog(true);
    };
    const handleOpenEdit = (c: Course) => {
        setEditingCourse(c);
        setName(c.name); setCode(c.code); setColor(c.color); setTerm(c.term || "");
        setOpenDialog(true);
    };
    const handleSubmit = async () => {
        if (!name) return;
        try {
            const payload = { name, code, color, term };
            if (editingCourse) {
                await updateCourse(editingCourse.id, payload);
            } else {
                await addCourse(payload);
            }
            setOpenDialog(false);
        } catch (e) { console.error(e); }
    };
    const handleDelete = async (id: string) => await deleteCourse(id);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
                    <p className="text-muted-foreground">Manage your enrolled courses and subjects.</p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="rounded-xl shadow-neon transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Course
                </Button>
            </div>

            {/* Course Grid */}
            {courses.length === 0 ? (
                <div className="py-16 text-center space-y-4 animate-fade-in">
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-vibrant-purple/10 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-vibrant-purple/60" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-foreground/80">No courses yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Add your first course to organize tasks by subject.</p>
                    </div>
                    <Button onClick={handleOpenCreate} className="rounded-xl mt-2">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Course
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course, i) => (
                        <Card
                            key={course.id}
                            className="group relative overflow-hidden rounded-2xl border-border/50 bg-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            {/* Gradient accent strip */}
                            <div
                                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                                style={{ backgroundColor: course.color }}
                            />
                            <CardHeader className="pt-5 pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 min-w-0">
                                        <CardTitle className="text-base font-semibold truncate">{course.name}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                                                {course.code}
                                            </span>
                                            {course.term && (
                                                <span className="text-xs text-muted-foreground">{course.term}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className="h-8 w-8 rounded-lg shrink-0 shadow-inner"
                                        style={{ backgroundColor: course.color + "30", border: `2px solid ${course.color}` }}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleOpenEdit(course)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => handleDelete(course.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-[480px] rounded-2xl bg-card">
                    <DialogHeader>
                        <DialogTitle>{editingCourse ? "Edit Course" : "Add Course"}</DialogTitle>
                        <DialogDescription>{editingCourse ? "Update course details." : "Add a new course to your semester."}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Course Name</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Data Structures" className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>Course Code</Label>
                                <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS201" className="rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Term / Semester</Label>
                            <Input value={term} onChange={e => setTerm(e.target.value)} placeholder="e.g. Spring 2026" className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1.5">
                                <Palette className="h-3.5 w-3.5" /> Color
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {presetColors.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`h-8 w-8 rounded-lg transition-all duration-150 hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:ring-1 hover:ring-border'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isLoading || !name} className="rounded-xl">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusySlotPainter } from "@/components/BusySlotPainter";
import { Loader2, User, Clock, Link as LinkIcon, Calendar, Settings2, Shield, CheckCircle2 } from "lucide-react";
import { PasswordStrengthIndicator, validatePassword } from "@/components/ui/password-strength";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function ChangePasswordSection() {
    const [open, setOpen] = useState(false);
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    function resetForm() {
        setCurrentPw(""); setNewPw(""); setConfirmPw(""); setPwMsg(null);
    }

    function handleOpenChange(v: boolean) {
        setOpen(v);
        if (!v) resetForm();
    }

    async function handleChangePassword() {
        setPwMsg(null);
        if (!currentPw || !newPw || !confirmPw) {
            setPwMsg({ type: "error", text: "All fields are required." }); return;
        }
        if (!validatePassword(newPw)) {
            setPwMsg({ type: "error", text: "Password does not meet all requirements." }); return;
        }
        if (newPw !== confirmPw) {
            setPwMsg({ type: "error", text: "New passwords do not match." }); return;
        }
        if (currentPw === newPw) {
            setPwMsg({ type: "error", text: "New password must be different from current password." }); return;
        }
        setPwLoading(true);
        try {
            await api.post("/auth/change-password", { current_password: currentPw, new_password: newPw });
            setPwMsg({ type: "success", text: "Password changed successfully!" });
            setTimeout(() => handleOpenChange(false), 1500);
        } catch (e: any) {
            setPwMsg({ type: "error", text: e?.response?.data?.detail || "Failed to change password." });
        }
        setPwLoading(false);
    }

    const isValid = validatePassword(newPw) && newPw === confirmPw && !!currentPw;

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-border/60 bg-accent/20 p-4">
                <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Update your password securely.</p>
                </div>
                <Button onClick={() => setOpen(true)} className="rounded-xl">
                    Change Password
                </Button>
            </div>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[440px] rounded-2xl bg-card">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label className="text-sm">Current Password</Label>
                            <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">New Password</Label>
                            <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" className="rounded-xl" />
                            <PasswordStrengthIndicator password={newPw} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Confirm New Password</Label>
                            <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" className="rounded-xl" />
                            {newPw && confirmPw && newPw !== confirmPw && (
                                <p className="text-xs text-destructive font-medium">Passwords do not match</p>
                            )}
                        </div>
                        {pwMsg && (
                            <div className={`text-sm px-3 py-2 rounded-lg flex items-center gap-2 ${pwMsg.type === "success" ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                                {pwMsg.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                                {pwMsg.text}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handleChangePassword} disabled={pwLoading || !isValid} className="rounded-xl">
                            {pwLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);

    // Profile State
    const [name, setName] = useState("");
    const [university, setUniversity] = useState("");
    const [major, setMajor] = useState("");

    // Preferences State
    const [chronotype, setChronotype] = useState("balanced");
    const [workStyle, setWorkStyle] = useState("mixed");
    const [sessionLength, setSessionLength] = useState(60);

    // Schedule State
    const [busyGrid, setBusyGrid] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadProfile();
        loadBusySlots();
    }, []);

    const DAY_NAME_TO_INDEX: Record<string, number> = {
        Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
        Friday: 4, Saturday: 5, Sunday: 6,
    };

    async function loadBusySlots() {
        try {
            const res = await api.get("/schedule/fixed");
            const grid: Record<string, boolean> = {};
            for (const slot of res.data ?? []) {
                const dayIdx = DAY_NAME_TO_INDEX[slot.day_of_week];
                if (dayIdx === undefined || !slot.start_time || !slot.end_time) continue;
                const startHour = parseInt(slot.start_time.split(":")[0], 10);
                const endHour = parseInt(slot.end_time.split(":")[0], 10);
                for (let h = startHour; h < endHour; h++) {
                    grid[`${dayIdx}-${h}`] = true;
                }
            }
            setBusyGrid(grid);
        } catch (e) { console.error(e); }
    }

    async function loadProfile() {
        try {
            const res = await api.get("/auth/me");
            if (res.data) {
                setName(res.data.name || "");
                setUniversity(res.data.university || "");
                setMajor(res.data.major || "");
                if (res.data.chronotype) setChronotype(res.data.chronotype);
                if (res.data.work_style) setWorkStyle(res.data.work_style);
                if (res.data.preferred_session_mins) setSessionLength(res.data.preferred_session_mins);
            }
        } catch (e) { console.error(e); }
    }

    async function handleSaveProfile() {
        setLoading(true);
        try {
            await api.post("/profile/baseline", { name, university, major, chronotype, work_style: workStyle, preferred_session_mins: sessionLength });
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    async function handleSaveSchedule() {
        setLoading(true);
        try {
            const slots: any[] = [];
            for (let d = 0; d < 7; d++) {
                const hours = Object.keys(busyGrid)
                    .filter(k => k.startsWith(`${d}-`) && busyGrid[k])
                    .map(k => parseInt(k.split("-")[1], 10))
                    .sort((a, b) => a - b);
                let i = 0;
                while (i < hours.length) {
                    const start = hours[i]; let end = start + 1; i++;
                    while (i < hours.length && hours[i] === end) { end++; i++; }
                    slots.push({ day_of_week: d, start_hour: start, end_hour: end, slot_type: "fixed", title: "Busy" });
                }
            }
            await api.post("/busy-slots/bulk", { slots });
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings2 className="h-7 w-7 text-primary" />
                    Settings
                </h1>
                <p className="text-muted-foreground">Manage your profile, preferences, and schedule.</p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="rounded-xl bg-secondary/60 p-1">
                    <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                        <User className="mr-1.5 h-4 w-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                        <Clock className="mr-1.5 h-4 w-4" /> Schedule
                    </TabsTrigger>
                    <TabsTrigger value="integrations" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                        <LinkIcon className="mr-1.5 h-4 w-4" /> Integrations
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 animate-fade-in">
                    {/* Profile */}
                    <Card className="rounded-2xl border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Profile</CardTitle>
                            <CardDescription>Your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>University</Label>
                                    <Input value={university} onChange={e => setUniversity(e.target.value)} placeholder="Your university" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Major</Label>
                                    <Input value={major} onChange={e => setMajor(e.target.value)} placeholder="Your major" className="rounded-xl" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleSaveProfile} disabled={loading} className="rounded-xl">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Profile
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card className="rounded-2xl border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Preferences</CardTitle>
                            <CardDescription>Help Schedora learn how you work best.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Chronotype</Label>
                                    <Select value={chronotype} onValueChange={setChronotype}>
                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="morning">🌅 Morning Lark</SelectItem>
                                            <SelectItem value="balanced">⚖️ Balanced</SelectItem>
                                            <SelectItem value="night">🌙 Night Owl</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Work Style</Label>
                                    <Select value={workStyle} onValueChange={setWorkStyle}>
                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="deep">🎯 Deep Work</SelectItem>
                                            <SelectItem value="mixed">🔄 Mixed</SelectItem>
                                            <SelectItem value="sprints">⚡ Sprints</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Session Length (min)</Label>
                                    <Input type="number" value={sessionLength} onChange={e => setSessionLength(parseInt(e.target.value || "0", 10))} min={15} max={240} className="rounded-xl" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleSaveProfile} disabled={loading} className="rounded-xl">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>


                    {/* Account Security */}
                    <Card className="rounded-2xl border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Account Security</CardTitle>
                            <CardDescription>Manage password and sign-in methods.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ChangePasswordSection />

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-dashed border-border/60 bg-accent/10 p-4">
                                <div>
                                    <p className="font-medium">Passkeys (WebAuthn)</p>
                                    <p className="text-sm text-muted-foreground">Use device biometrics instead of passwords (UI stub).</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => alert("Passkey setup needs WebAuthn + backend support. This is a frontend-only stub.")}
                                >
                                    Set up passkey
                                </Button>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-dashed border-border/60 bg-accent/10 p-4">
                                <div>
                                    <p className="font-medium">Google sign-in</p>
                                    <p className="text-sm text-muted-foreground">Sign in faster with Google (UI stub).</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => alert("Google OAuth needs backend configuration. This is a frontend-only stub.")}
                                >
                                    Connect Google
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </TabsContent>

                <TabsContent value="schedule" className="space-y-6 animate-fade-in">
                    <Card className="rounded-2xl border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Fixed Weekly Schedule
                            </CardTitle>
                            <CardDescription>Paint your recurring busy slots (classes, work, etc). The scheduler will avoid these times.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <BusySlotPainter value={busyGrid} onChange={setBusyGrid} />
                            <div className="flex justify-end">
                                <Button onClick={handleSaveSchedule} disabled={loading} className="rounded-xl">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Schedule
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="integrations" className="space-y-6 animate-fade-in">
                    <Card className="rounded-2xl border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Google Calendar</CardTitle>
                            <CardDescription>Connect your Google Calendar to import events as busy slots.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-xl border border-dashed border-border/60 bg-accent/20 p-6">
                                <div className="space-y-1">
                                    <p className="font-medium">Google Calendar</p>
                                    <p className="text-sm text-muted-foreground">Import events and export scheduled tasks.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => alert("Google Calendar connect is a UI stub in the frontend-only build.")}
                                >
                                    Connect
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusySlotPainter } from "@/components/BusySlotPainter";
import { Loader2, User, Clock, Link as LinkIcon, Calendar, Settings2, Shield, CheckCircle2, ExternalLink, RefreshCw, Upload, Unlink } from "lucide-react";
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
    const token = useAuthStore((s) => s.token);
    const [searchParams] = useSearchParams();
    const defaultTab = searchParams.get("tab") || "general";

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

    // Google Calendar State
    const [syncStatus, setSyncStatus] = useState<any>(null);
    const [syncLoading, setSyncLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        loadProfile();
        loadBusySlots();
        loadSyncStatus();
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

    async function loadSyncStatus() {
        try {
            const res = await api.get("/sync/status");
            setSyncStatus(res.data);
        } catch { setSyncStatus(null); }
    }

    async function connectGoogle() {
        setGoogleLoading(true);
        try {
            const res = await api.get("/auth/google/authorize");
            if (res.data?.authorization_url) {
                window.location.href = res.data.authorization_url;
            }
        } catch (e) {
            console.error("Failed to get Google auth URL", e);
        }
        setGoogleLoading(false);
    }

    async function handleSyncNow() {
        setSyncLoading(true);
        try {
            await api.post("/sync/trigger");
            await loadSyncStatus();
        } catch (e) { console.error(e); }
        setSyncLoading(false);
    }

    async function handlePushAll() {
        setSyncLoading(true);
        try {
            await api.post("/sync/push-all");
            await loadSyncStatus();
        } catch (e) { console.error(e); }
        setSyncLoading(false);
    }

    const isGoogleLinked = syncStatus?.sync_initialized === true;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings2 className="h-7 w-7 text-primary" />
                    Settings
                </h1>
                <p className="text-muted-foreground">Manage your profile, preferences, and schedule.</p>
            </div>

            <Tabs defaultValue={defaultTab} className="space-y-6">
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
                                    <p className="font-medium">Google Calendar</p>
                                    <p className="text-sm text-muted-foreground">
                                        {isGoogleLinked ? "Your Google Calendar is connected." : "Link your Google account for calendar sync."}
                                    </p>
                                </div>
                                {isGoogleLinked ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                                    </span>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={connectGoogle}
                                        disabled={googleLoading}
                                    >
                                        {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Connect Google
                                    </Button>
                                )}
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
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Google Calendar
                            </CardTitle>
                            <CardDescription>Connect your Google Calendar to import events and export scheduled tasks.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Connection Status */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-border/60 bg-accent/20 p-5">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">Connection Status</p>
                                        {isGoogleLinked ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                                                <CheckCircle2 className="h-3 w-3" /> Connected
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-600">
                                                <Unlink className="h-3 w-3" /> Not Connected
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {isGoogleLinked
                                            ? `Calendar ID: ${syncStatus?.google_calendar_id || "primary"}`
                                            : "Connect your Google account to enable two-way calendar sync."}
                                    </p>
                                    {isGoogleLinked && syncStatus?.last_synced_at && (
                                        <p className="text-xs text-muted-foreground">
                                            Last synced: {new Date(syncStatus.last_synced_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                {!isGoogleLinked ? (
                                    <Button onClick={connectGoogle} disabled={googleLoading} className="rounded-xl">
                                        {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                                        Connect Google Calendar
                                    </Button>
                                ) : null}
                            </div>

                            {/* Sync Controls — only visible when connected */}
                            {isGoogleLinked && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        onClick={handleSyncNow}
                                        disabled={syncLoading}
                                        className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-accent/30 disabled:opacity-50"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <RefreshCw className={`h-5 w-5 text-primary ${syncLoading ? 'animate-spin' : ''}`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Sync Now</p>
                                            <p className="text-xs text-muted-foreground">Pull latest events from Google Calendar</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handlePushAll}
                                        disabled={syncLoading}
                                        className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-accent/30 disabled:opacity-50"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <Upload className={`h-5 w-5 text-primary ${syncLoading ? 'animate-spin' : ''}`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Push to Google</p>
                                            <p className="text-xs text-muted-foreground">Export un-synced local slots to Google</p>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

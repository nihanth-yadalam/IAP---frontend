import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/useAuthStore";
import { User, Settings, LogOut, GraduationCap, Sunrise, Sunset, RefreshCw } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/theme-provider";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import morningAvatar from "@/assets/avatars/morning.svg";
import balancedAvatar from "@/assets/avatars/balanced.svg";
import nightAvatar from "@/assets/avatars/night.svg";

export function AppLayout() {
    const { user, logout } = useAuthStore();
    const { theme } = useTheme();

    // Sync state
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState<string | null>(null);

    // Fetch sync status on mount
    useEffect(() => {
        if (user?.google_linked) {
            api.get("/sync/status").then((res) => {
                if (res.data?.last_synced_at) {
                    setLastSynced(res.data.last_synced_at);
                }
            }).catch(console.error);
        }
    }, [user?.google_linked]);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await api.post("/sync/trigger");
            if (res.data?.synced_at) {
                setLastSynced(res.data.synced_at);
            }
        } catch (e) {
            console.error("Sync failed", e);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <main className="flex-1 min-w-0 lg:pl-[68px] transition-all duration-300 ease-in-out">
                {/* Top Bar */}
                <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-xl px-6">
                    <div className="flex items-center gap-3 lg:hidden">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-vibrant-purple bg-clip-text text-transparent relative z-10">
                            Schedora
                        </span>

                        <div className="hidden lg:flex items-center gap-2 text-muted-foreground text-sm font-medium">
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        {/* Sync Button */}
                        {user?.google_linked && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleSync}
                                            disabled={isSyncing}
                                            className="rounded-full w-9 h-9"
                                        >
                                            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Sync with Google Calendar</p>
                                        {lastSynced && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Last: {new Date(lastSynced).toLocaleString()}
                                            </p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-border hover:ring-primary/30 transition-all active:scale-95">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage
                                            src={user?.avatar_url || (user?.chronotype === "morning" ? morningAvatar : user?.chronotype === "night" ? nightAvatar : balancedAvatar)}
                                            alt={user?.username}
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center">
                                            {user?.chronotype === "morning" ? <Sunrise className="h-5 w-5" /> : user?.chronotype === "night" ? <Sunset className="h-5 w-5" /> : (user?.username?.substring(0, 2).toUpperCase() || "U")}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 rounded-xl border shadow-xl dropdown-solid-bg" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold leading-none capitalize text-foreground">{user?.username}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-foreground focus:bg-accent focus:text-accent-foreground">
                                    <Link to="/settings">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-foreground focus:bg-accent focus:text-accent-foreground">
                                    <Link to="/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg"
                                    onClick={() => logout()}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

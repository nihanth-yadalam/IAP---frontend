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
import { User, Settings, LogOut, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Link } from "react-router-dom";

import morningAvatar from "@/assets/avatars/morning.svg";
import balancedAvatar from "@/assets/avatars/balanced.svg";
import nightAvatar from "@/assets/avatars/night.svg";

export function AppLayout() {
    const { user, logout } = useAuthStore();
    const { setTheme, theme } = useTheme();

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <main className="flex-1 min-w-0 lg:pl-[68px] transition-all duration-300 ease-in-out">
                {/* Top Bar */}
                <div className="sticky top-0 z-30 flex h-16 items-center justify-end border-b bg-background/80 backdrop-blur-xl px-6">
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-accent transition-colors relative"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>

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
                            <DropdownMenuContent className="w-56 rounded-xl border border-zinc-200 text-zinc-900 shadow-xl dropdown-solid-bg dark:border-zinc-700 dark:text-zinc-100" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal text-zinc-900 dark:text-zinc-100">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold leading-none capitalize">{user?.username}</p>
                                        <p className="text-xs leading-none text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-800 dark:focus:text-zinc-100">
                                    <Link to="/settings">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 dark:text-zinc-100 dark:focus:bg-zinc-800 dark:focus:text-zinc-100">
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

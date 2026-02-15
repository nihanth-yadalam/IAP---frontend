import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Home,
    Calendar,
    ListTodo,
    Columns3,
    BookOpen,
    Settings,
    Menu,
    X,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: ListTodo, label: "Tasks", href: "/tasks" },
    { icon: Columns3, label: "Kanban", href: "/kanban" },
    { icon: BookOpen, label: "Courses", href: "/courses" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
    return (
        <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <GraduationCap className="h-5 w-5" />
            </div>
            {!collapsed && (
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-vibrant-purple bg-clip-text text-transparent animate-fade-in">
                    Schedora
                </span>
            )}
        </div>
    );
}

function NavItem({ item, collapsed, isMobile }: { item: typeof navItems[0]; collapsed: boolean; isMobile?: boolean }) {
    const location = useLocation();
    const isActive = location.pathname === item.href
        || (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

    const link = (
        <NavLink
            to={item.href}
            className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && !isMobile && "justify-center px-2"
            )}
        >
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary animate-scale-in" />
            )}
            <item.icon className={cn(
                "h-[18px] w-[18px] shrink-0 transition-transform duration-200",
                isActive && "text-primary",
                !isActive && "group-hover:scale-110"
            )} />
            {(!collapsed || isMobile) && (
                <span className="animate-fade-in">{item.label}</span>
            )}
        </NavLink>
    );

    if (collapsed && !isMobile) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                    {item.label}
                </TooltipContent>
            </Tooltip>
        );
    }

    return link;
}

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(true);

    return (
        <TooltipProvider>
            {/* Mobile hamburger trigger */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="fixed top-4 left-4 z-50 lg:hidden rounded-xl shadow-neon bg-card/80 backdrop-blur-sm"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 border-r-0">
                    <div className="flex flex-col h-full bg-sidebar p-4">
                        <SidebarBrand collapsed={false} />
                        <Separator className="my-3 opacity-50" />
                        <nav className="flex-1 space-y-1">
                            {navItems.map((item) => (
                                <NavItem key={item.href} item={item} collapsed={false} isMobile />
                            ))}
                        </nav>
                        <div className="mt-auto pt-4">
                            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-vibrant-blue/20 p-4">
                                <p className="text-xs font-medium text-foreground/80">✨ Stay consistent</p>
                                <p className="text-[11px] text-muted-foreground mt-1">Small steps lead to big results.</p>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col fixed left-0 top-0 z-40 h-screen border-r bg-sidebar/80 backdrop-blur-xl transition-all duration-300 ease-in-out",
                    collapsed ? "w-[68px]" : "w-60"
                )}
            >
                <div className="flex flex-col h-full py-4 px-2">
                    <SidebarBrand collapsed={collapsed} />
                    <Separator className="my-3 mx-1 opacity-30" />

                    <nav className="flex-1 space-y-1 px-1">
                        {navItems.map((item) => (
                            <NavItem key={item.href} item={item} collapsed={collapsed} />
                        ))}
                    </nav>

                    <div className="px-1 pt-4 mt-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCollapsed(!collapsed)}
                            className={cn(
                                "w-full rounded-xl text-muted-foreground hover:text-foreground transition-colors",
                                collapsed ? "justify-center px-2" : "justify-start"
                            )}
                        >
                            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
                        </Button>
                    </div>
                </div>
            </aside>
        </TooltipProvider>
    );
}

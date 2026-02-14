import { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { GraduationCap } from "lucide-react";

// ... inside component ...
{/* Branding Content */ }
<div className="relative z-20 flex items-center text-lg font-medium">
    <GraduationCap className="mr-2 h-6 w-6" />
    Schedora
</div>

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full grid md:grid-cols-2 lg:px-0 overflow-hidden">
            {/* Right Side: Decorative Gradient (Visible on Desktop) */}
            <div className="relative hidden md:flex h-full flex-col bg-muted p-10 text-white dark:border-r">
                {/* Dynamic Gradient Background */}
                <div className="absolute inset-0 bg-zinc-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-soft-light" />
                </div>

                {/* Branding Content */}
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <GraduationCap className="mr-2 h-6 w-6" />
                    Schedora
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;The only way to manage time is to manage your energy. L1 helps you do exactly that.&rdquo;
                        </p>
                        <footer className="text-sm text-white/80">L1 Concept</footer>
                    </blockquote>
                </div>
            </div>

            {/* Left Side: Form Container */}
            <div className="flex flex-col items-center justify-center p-8 bg-background relative">
                {/* Theme Toggle Positioned Top-Right */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8">
                    <ThemeToggle />
                </div>

                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {subtitle}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

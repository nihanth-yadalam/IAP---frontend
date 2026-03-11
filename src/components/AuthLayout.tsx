import { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { GraduationCap } from "lucide-react";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

const DECORATIONS = [
    { emoji: '✦', top: '12%', left: '10%', delay: '0s', size: '1.2rem' },
    { emoji: '✦', top: '28%', left: '75%', delay: '1s', size: '0.8rem' },
    { emoji: '✦', top: '55%', left: '20%', delay: '2s', size: '1rem' },
    { emoji: '✦', top: '80%', left: '80%', delay: '1s', size: '1rem' },
    { emoji: '✦', top: '40%', left: '88%', delay: '2.5s', size: '1.2rem' },
    { emoji: '✦', top: '65%', left: '8%', delay: '0.8s', size: '1.1rem' },
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full grid md:grid-cols-2 lg:px-0 overflow-hidden">
            {/* Left Side: Animated Decorative Panel */}
            <div className="relative hidden md:flex h-full flex-col p-10 text-white overflow-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 animate-gradient" style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899, #06b6d4, #8b5cf6, #6366f1)',
                    backgroundSize: '300% 300%',
                }} />

                {/* Geometric orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full opacity-30 animate-float-slow" style={{ background: 'radial-gradient(circle, #fff, transparent 70%)' }} />
                <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 rounded-full opacity-20 animate-float-slow" style={{ background: 'radial-gradient(circle, #fff, transparent 70%)', animationDelay: '2s' }} />
                <div className="absolute top-[40%] right-[5%] w-40 h-40 rounded-full opacity-15 animate-float" style={{ background: 'radial-gradient(circle, #fff, transparent 70%)', animationDelay: '1s' }} />

                {/* Floating emoji decorations */}
                {DECORATIONS.map((d, i) => (
                    <span key={i}
                        className="absolute animate-float select-none pointer-events-none"
                        style={{ top: d.top, left: d.left, animationDelay: d.delay, fontSize: d.size, opacity: 0.8 }}
                    >{d.emoji}</span>
                ))}

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.07]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

                {/* Branding */}
                <div className="relative z-20 flex items-center gap-3 animate-slide-up">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">Schedora</span>
                    <span className="text-white/80 animate-twinkle">✨</span>
                </div>

                <div className="relative z-20 mt-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>

                    <h2 className="text-3xl font-bold mb-3 leading-tight drop-shadow-md">
                        Your AI-powered<br />Intelligent Academic Planner
                    </h2>
                    <p className="text-white/80 text-lg leading-relaxed mb-8">
                        Smart scheduling that understands your energy, your habits, and your deadlines.
                    </p>

                    <div className="flex flex-col gap-3">
                        {[
                            { icon: '⚪', text: 'AI estimates task duration from your history' },
                            { icon: '⚪', text: 'Matches hard tasks with your peak focus hours' },
                            { icon: '⚪', text: 'Adapts in real-time when life changes' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${0.4 + i * 0.15}s` }}>
                                <span className="text-xl mt-0.5">{f.icon}</span>
                                <span className="text-white/90 text-sm leading-relaxed">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Form Container */}
            <div className="flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
                {/* Subtle radial gradient */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(ellipse at 60% 20%, hsla(260,90%,65%,0.06) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, hsla(190,90%,50%,0.05) 0%, transparent 60%)'
                }} />

                {/* Twinkling stars */}
                {['12%', '35%', '75%', '88%', '55%'].map((top, i) => (
                    <span key={i} className="absolute text-yellow-300/40 animate-twinkle pointer-events-none select-none"
                        style={{ top, left: `${[8, 92, 5, 88, 48][i]}%`, animationDelay: `${i * 0.5}s`, fontSize: '0.7rem' }}>
                        ✦
                    </span>
                ))}

                {/* Theme Toggle Positioned Top-Right */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
                    <ThemeToggle />
                </div>

                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px] relative z-10 animate-scale-in">
                    {/* Mobile Logo */}
                    <div className="flex md:hidden items-center justify-center gap-2 mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                            <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xl font-bold gradient-text">Schedora</span>
                    </div>

                    <div className="flex flex-col space-y-1.5 text-center">
                        <h1 className="text-2xl font-bold tracking-tight gradient-text">
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

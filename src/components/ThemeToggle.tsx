import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial state
    const root = window.document.documentElement;
    setIsDark(root.classList.contains('dark'));

    // Observe class changes on html element to update state reactively
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'));
    });

    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    // Logic: If currently dark (system or manual), switch to light. Else dark.
    // This allows breaking out of 'system' mode into manual override clearly.
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full bg-background/95 border border-border shadow-sm hover:shadow-md transition-all duration-300"
      onClick={toggleTheme}
    >
      {isDark ? (
        <Sun className="h-[1.5rem] w-[1.4rem] scale-100 transition-all text-orange-500 fill-orange-500" />
      ) : (
        <Moon className="h-[1.5rem] w-[1.5rem] scale-100 transition-all text-blue-500 fill-blue-500" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

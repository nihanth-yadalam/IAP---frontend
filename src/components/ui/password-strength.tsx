import { Check, X } from "lucide-react";
import { useMemo } from "react";

export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const defaultRequirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (pwd: string) => pwd.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (pwd: string) => /[A-Z]/.test(pwd),
  },
  {
    label: "One number",
    test: (pwd: string) => /[0-9]/.test(pwd),
  },
  {
    label: "One special character",
    test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
  },
];

interface PasswordStrengthIndicatorProps {
  password: string;
  requirements?: PasswordRequirement[];
}

export function PasswordStrengthIndicator({ 
  password, 
  requirements = defaultRequirements 
}: PasswordStrengthIndicatorProps) {
  const results = useMemo(() => {
    return requirements.map((req) => ({
      ...req,
      met: req.test(password),
    }));
  }, [password, requirements]);

  const metCount = results.filter((r) => r.met).length;
  const totalCount = results.length;
  const percentage = (metCount / totalCount) * 100;

  // Determine strength level and color
  const getStrengthLevel = () => {
    if (percentage === 0) return { label: "No password", color: "bg-muted" };
    if (percentage < 50) return { label: "Weak", color: "bg-destructive" };
    if (percentage < 75) return { label: "Fair", color: "bg-vibrant-orange" };
    if (percentage < 100) return { label: "Good", color: "bg-vibrant-blue" };
    return { label: "Strong", color: "bg-vibrant-green" };
  };

  const strength = getStrengthLevel();

  if (!password) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">Password strength</span>
          <span className={`font-semibold ${
            percentage === 100 ? 'text-vibrant-green' : 
            percentage >= 75 ? 'text-vibrant-blue' : 
            percentage >= 50 ? 'text-vibrant-orange' : 
            'text-destructive'
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out ${strength.color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
              result.met ? "text-vibrant-green" : "text-muted-foreground"
            }`}
          >
            <div className={`flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full transition-all duration-200 ${
              result.met 
                ? "bg-vibrant-green/20 scale-100" 
                : "bg-muted scale-95"
            }`}>
              {result.met ? (
                <Check className="w-3 h-3 text-vibrant-green" strokeWidth={3} />
              ) : (
                <X className="w-3 h-3 text-muted-foreground/50" strokeWidth={2} />
              )}
            </div>
            <span className={`font-medium ${result.met ? "line-through" : ""}`}>
              {result.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export a function to check if password meets all requirements
export function validatePassword(password: string, requirements = defaultRequirements): boolean {
  return requirements.every((req) => req.test(password));
}

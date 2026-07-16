"use client";

import { useMemo, useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: "At least 8 characters" },
  { regex: /[0-9]/, text: "At least 1 number" },
  { regex: /[a-z]/, text: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  { regex: /[!-\/:-@[-`{-~]/, text: "At least 1 special character" },
] as const;

type StrengthScore = 0 | 1 | 2 | 3 | 4 | 5;

const STRENGTH_TEXT: Record<Exclude<StrengthScore, 5>, string> = {
  0: "Enter a password",
  1: "Weak password",
  2: "Medium password",
  3: "Strong password",
  4: "Very strong password",
};

type PasswordInputProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showRequirements?: boolean;
  className?: string;
};

export default function PasswordInput({
  id = "password",
  label = "Password",
  value,
  onChange,
  placeholder = "Password",
  required = false,
  disabled = false,
  showRequirements = true,
  className,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  const strength = useMemo(() => {
    const requirements = PASSWORD_REQUIREMENTS.map((requirement) => ({
      met: requirement.regex.test(value),
      text: requirement.text,
    }));

    return {
      score: requirements.filter((requirement) => requirement.met).length as StrengthScore,
      requirements,
    };
  }, [value]);

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={showRequirements && value.length > 0 && strength.score < 4}
          aria-describedby={showRequirements ? `${id}-strength` : undefined}
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          disabled={disabled}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition hover:text-foreground disabled:pointer-events-none"
        >
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showRequirements ? (
        <>
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 flex-1 rounded-full bg-border",
                  strength.score > index && "bg-emerald-500"
                )}
              />
            ))}
          </div>

          <p id={`${id}-strength`} className="flex justify-between text-xs text-muted-foreground">
            <span>Must contain:</span>
            <span>{STRENGTH_TEXT[Math.min(strength.score, 4) as keyof typeof STRENGTH_TEXT]}</span>
          </p>

          <ul className="grid gap-1" aria-label="Password requirements">
            {strength.requirements.map((requirement) => (
              <li key={requirement.text} className="flex items-center gap-2 text-xs">
                {requirement.met ? (
                  <Check size={14} className="text-emerald-600" />
                ) : (
                  <X size={14} className="text-muted-foreground" />
                )}
                <span className={requirement.met ? "text-emerald-700" : "text-muted-foreground"}>
                  {requirement.text}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

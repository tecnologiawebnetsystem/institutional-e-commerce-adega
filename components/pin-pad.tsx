"use client";

import { useState, useCallback } from "react";
import { Delete } from "lucide-react";

interface PinPadProps {
  /** Called when all 4 digits have been entered */
  onComplete: (pin: string) => void;
  /** Accent color class for the dots, e.g. "bg-violet-500" */
  accentColor?: string;
  /** Whether to disable interaction (e.g. while loading) */
  disabled?: boolean;
  /** Label above the pin dots */
  label?: string;
}

export default function PinPad({
  onComplete,
  accentColor = "bg-primary",
  disabled = false,
  label = "Digite seu PIN de 4 digitos",
}: PinPadProps) {
  const [digits, setDigits] = useState<string[]>([]);

  const handlePress = useCallback(
    (num: string) => {
      if (disabled) return;
      if (digits.length >= 4) return;

      const next = [...digits, num];
      setDigits(next);

      if (next.length === 4) {
        // Small delay so the user sees the 4th dot fill
        setTimeout(() => {
          onComplete(next.join(""));
          setDigits([]);
        }, 200);
      }
    },
    [digits, disabled, onComplete]
  );

  const handleDelete = useCallback(() => {
    if (disabled) return;
    setDigits((prev) => prev.slice(0, -1));
  }, [disabled]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    setDigits([]);
  }, [disabled]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Label */}
      <p className="text-sm font-medium text-foreground">{label}</p>

      {/* PIN dots */}
      <div className="flex items-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
              i < digits.length
                ? `${accentColor} border-transparent scale-110`
                : "border-muted-foreground/40 bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Numeric keypad */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            type="button"
            disabled={disabled || digits.length >= 4}
            onClick={() => handlePress(num)}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-input bg-secondary text-xl font-semibold text-foreground transition-all hover:bg-accent hover:border-primary/40 active:scale-95 disabled:opacity-40"
          >
            {num}
          </button>
        ))}

        {/* Clear */}
        <button
          type="button"
          disabled={disabled || digits.length === 0}
          onClick={handleClear}
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-input bg-secondary text-xs font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95 disabled:opacity-40"
        >
          Limpar
        </button>

        {/* 0 */}
        <button
          type="button"
          disabled={disabled || digits.length >= 4}
          onClick={() => handlePress("0")}
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-input bg-secondary text-xl font-semibold text-foreground transition-all hover:bg-accent hover:border-primary/40 active:scale-95 disabled:opacity-40"
        >
          0
        </button>

        {/* Backspace */}
        <button
          type="button"
          disabled={disabled || digits.length === 0}
          onClick={handleDelete}
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-input bg-secondary text-muted-foreground transition-all hover:bg-accent hover:text-foreground active:scale-95 disabled:opacity-40"
          aria-label="Apagar"
        >
          <Delete className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

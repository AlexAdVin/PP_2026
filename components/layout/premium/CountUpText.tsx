import React, { useEffect, useMemo, useState } from "react";
import { Text } from "react-native";

type CountUpTextProps = {
  value: number;
  durationMs?: number;
  formatter?: (value: number) => string;
  style?: any;
};

export default function CountUpText({
  value,
  durationMs = 1200,
  formatter,
  style,
}: CountUpTextProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    setDisplayValue(0);
    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [durationMs, value]);

  const label = useMemo(() => {
    if (formatter) {
      return formatter(displayValue);
    }

    return Math.round(displayValue).toString();
  }, [displayValue, formatter]);

  return <Text style={style}>{label}</Text>;
}
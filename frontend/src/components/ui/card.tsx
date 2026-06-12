import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div className={`rounded-2xl border ${className}`}
      style={{ background: "var(--card)", borderColor: "var(--card-border)" }} {...props} />
  );
}

export function CardContent({ className = "", ...props }: CardContentProps) {
  return <div className={`p-6 ${className}`} {...props} />;
}

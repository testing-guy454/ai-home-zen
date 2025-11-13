import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default: "border-primary/40 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-[0_0_16px_hsl(var(--primary)_/_0.3)]",
        secondary: "border-secondary/50 bg-secondary/70 text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm",
        destructive: "border-destructive/40 bg-destructive/20 text-destructive hover:bg-destructive/25",
        outline: "border-border/60 bg-background/40 text-foreground hover:bg-accent/10 hover:border-accent/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground ring-offset-background transition-all duration-300",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground/70",
          "hover:border-primary/40 hover:bg-primary/[0.02]",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:border-primary focus-visible:bg-primary/[0.03] focus-visible:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

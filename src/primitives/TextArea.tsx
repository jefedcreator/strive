import { cn } from "@/utils";
import * as React from "react";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "border-bca-grey-5 border-opacity-40 text-bca-grey-4 h-15 min-h-15 w-full resize-none rounded-md border px-3 py-[0.69rem] text-sm font-semibold focus:outline-none focus-visible:rounded-md disabled:opacity-50", // Added resize-none to disable resizing
        className,
      )}
      draggable="false"
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

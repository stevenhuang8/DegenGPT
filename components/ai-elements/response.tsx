"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { code } from "@streamdown/code";
import { Streamdown } from "streamdown";

type ResponseProps = ComponentProps<typeof Streamdown>;

// Streamdown 2 only highlights code when the plugin is passed in.
const plugins = { code };

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      plugins={plugins}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";

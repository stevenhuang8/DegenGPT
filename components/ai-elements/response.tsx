"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { code } from "@streamdown/code";
import { defaultRehypePlugins, Streamdown } from "streamdown";

type ResponseProps = ComponentProps<typeof Streamdown>;
type RehypePlugins = NonNullable<ResponseProps["rehypePlugins"]>;

// Streamdown 2 only highlights code when the plugin is passed in.
const plugins = { code };

// Block all images. Loading one sends a request to its host, so an injected
// image URL could leak the conversation without the user clicking anything.
const [harden, hardenOptions] = defaultRehypePlugins.harden as [
  RehypePlugins[number],
  object,
];
const rehypePlugins = [
  defaultRehypePlugins.raw,
  defaultRehypePlugins.sanitize,
  [
    harden,
    { ...hardenOptions, allowedImagePrefixes: [], allowDataImages: false },
  ],
] as RehypePlugins;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      plugins={plugins}
      rehypePlugins={rehypePlugins}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";

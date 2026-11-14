import React from "react";

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: "div" | "article" | "section";
  className?: string;
}

/**
 * Prose wrapper component for long-form reading content.
 * Enforces:
 * - Max line-width of 70 characters (max-w-[70ch])
 * - Defined type-scale (h1: 36/44 (28/36 mobile), h2: 28/36, h3: 22/30, body: 17/28, small: 14/22)
 * - Optimal line-height and contrast across English, Devanagari, and Gujarati typography
 */
export function Prose({ children, as: Component = "div", className = "", ...props }: ProseProps) {
  return (
    <Component
      className={`text-body text-text [&_h1]:text-h1 [&_h1]:text-text [&_h2]:text-h2 [&_h2]:text-text [&_h3]:text-h3 [&_h3]:text-text [&_p]:text-body [&_p]:text-text [&_small]:text-small [&_small]:text-muted [&_li]:text-body [&_li]:text-text [&_a]:text-primary hover:[&_a]:text-primary-hover [&_strong]:text-text [&_blockquote]:border-primary [&_blockquote]:text-muted max-w-[70ch] [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:mt-5 [&_h3]:mb-2 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

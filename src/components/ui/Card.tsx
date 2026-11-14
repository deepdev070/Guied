import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  children: React.ReactNode;
  padding?: CardPadding;
  hoverLift?: boolean;
  href?: string;
  as?: "div" | "article" | "section";
  className?: string;
}

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

/**
 * Reusable Card container component.
 * Features:
 * - Padding options: none, sm (16px), md (20-24px), lg (24-32px)
 * - Optional hover lift transition (-translate-y-1 + soft shadow)
 * - Polymorphic clickable card rendering as Next.js Link when href is provided
 * - WCAG AA accessible focus rings
 */
export const Card = React.forwardRef<HTMLDivElement | HTMLAnchorElement, CardProps>(function Card(
  { children, padding = "md", hoverLift = false, href, as: Component = "div", className, ...props },
  ref
) {
  const isClickable = Boolean(href);
  const shouldLift = hoverLift || isClickable;

  const baseClasses = cn(
    "group rounded-card border border-border bg-background shadow-soft-sm text-text transition-all duration-200 ease-out",
    paddingStyles[padding],
    shouldLift && "hover:-translate-y-1 hover:shadow-soft-md",
    isClickable &&
      "block cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/40 focus-visible:ring-offset-2",
    className
  );

  if (href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={baseClasses}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <Component ref={ref as React.Ref<HTMLDivElement>} className={baseClasses} {...props}>
      {children}
    </Component>
  );
});

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}

export function CardTitle({ children, as: Component = "h3", className, ...props }: CardTitleProps) {
  return (
    <Component
      className={cn("text-h3 text-text font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className, ...props }: CardBodyProps) {
  return (
    <div className={cn("text-body text-muted mt-2", className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "border-border text-small text-muted mt-4 flex items-center justify-between border-t pt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface IconCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  iconBgColor?: string;
  badge?: React.ReactNode;
  className?: string;
}

/**
 * IconCard for Category & Service Tiles.
 * - 48px soft-colour icon circle
 * - Title
 * - One-line description (line-clamp-1)
 * - Clickable with hover lift when href is provided
 */
export function IconCard({
  icon,
  title,
  description,
  href,
  iconBgColor = "bg-primary-soft text-primary",
  badge,
  className,
}: IconCardProps) {
  return (
    <Card
      href={href}
      hoverLift
      padding="md"
      className={cn("flex flex-col justify-between", className)}
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div
            className={cn(
              "flex h-12 min-h-[48px] w-12 min-w-[48px] items-center justify-center rounded-full font-bold",
              iconBgColor
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
          {badge && <div>{badge}</div>}
        </div>

        <CardTitle as="h3" className="group-hover:text-primary transition-colors">
          {title}
        </CardTitle>

        <p className="text-small text-muted mt-1 line-clamp-1">{description}</p>
      </div>

      {href && (
        <div className="text-small text-primary mt-4 flex items-center gap-1 font-semibold transition-transform group-hover:translate-x-1">
          <span>View guides</span>
          <span aria-hidden="true">→</span>
        </div>
      )}
    </Card>
  );
}

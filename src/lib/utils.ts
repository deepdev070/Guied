export type ClassValue = string | number | boolean | undefined | null;

/**
 * Concatenates class names conditionally without extraneous falsy values.
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

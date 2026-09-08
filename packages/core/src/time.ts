/**
 * Calendar helpers, kept in their own module so both the daily rollup and the
 * cortisol analysis can use them without importing each other.
 */

/**
 * Local, not UTC. A night belongs to the calendar day you wake up on, and that
 * is a local-time question — scoring it in UTC would move some people's nights
 * onto the wrong day.
 */
export function dayKey(t: number): string {
  const d = new Date(t);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

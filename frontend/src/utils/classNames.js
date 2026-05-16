export function cn(...tokens) {
  return tokens
    .flatMap((token) => (Array.isArray(token) ? token : [token]))
    .filter(Boolean)
    .join(" ");
}

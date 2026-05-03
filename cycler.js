export function getNextIndex(current, length) {
  if (length === 0) return 0;
  return (current + 1) % length;
}
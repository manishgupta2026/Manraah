export function getInitials(name?: string): string {
  if (!name) return "ME";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "ME";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getPastelBgColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  const s = 65; // High saturation for vivid pastel
  const l = 85; // Light pastel background
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function getPastelTextColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  const s = 70;
  const l = 30; // Darker font color for readability
  return `hsl(${h}, ${s}%, ${l}%)`;
}

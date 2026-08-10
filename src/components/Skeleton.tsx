// =========================================================
// Skeleton — primitives para loading.tsx.
// Usa animação pulse nativa do Tailwind para evitar layout
// shift quando o conteúdo real chega.
// =========================================================

export function SkeletonLine({
  className = "",
  width,
}: {
  className?: string;
  width?: string;
}) {
  return (
    <div
      className={`h-3 rounded-md bg-white/[0.06] animate-pulse ${className}`}
      style={width ? { width } : undefined}
    />
  );
}

export function SkeletonBlock({
  className = "",
  height = "h-32",
}: {
  className?: string;
  height?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-pulse ${height} ${className}`}
    />
  );
}

export function SkeletonChip({ width = "w-20" }: { width?: string }) {
  return (
    <div
      className={`h-5 rounded-full border border-white/[0.06] bg-white/[0.04] animate-pulse ${width}`}
    />
  );
}

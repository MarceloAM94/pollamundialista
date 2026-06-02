export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
        borderRadius: "8px",
      }}
    />
  );
}

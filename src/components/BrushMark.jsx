// Five-bar brush wordmark used across the app.
export default function BrushMark({ size = 22, light = false }) {
  const base = light ? '#f6f2ec' : '#211c17';
  const accent = light ? '#e8915f' : '#c9622e';
  const bars = [0.5, 0.78, 1, 0.62, 0.38];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: size * 0.13, height: size }}>
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            width: Math.max(2.5, size * 0.13),
            height: size * h,
            background: i === 2 ? accent : base,
            borderRadius: 2,
          }}
        />
      ))}
    </span>
  );
}

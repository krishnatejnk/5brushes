const MAP = {
  approved: { label: 'Approved', color: '#2f7d5b', bg: 'rgba(47,125,91,0.12)' },
  pending:  { label: 'Pending review', color: '#a94e22', bg: 'rgba(201,98,46,0.12)' },
  rejected: { label: 'Needs changes', color: '#b23b3b', bg: 'rgba(178,59,59,0.12)' },
};

export default function StatusBadge({ status }) {
  const s = MAP[status] || MAP.pending;
  return (
    <span className="badge" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

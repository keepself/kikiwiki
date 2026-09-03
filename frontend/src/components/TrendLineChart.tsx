export interface TrendPoint {
  dateLabel: string;
  valueLabel: string;
  value: number;
  highlighted?: boolean;
}

interface Props {
  points: TrendPoint[];
  color?: string;
  highlightColor?: string;
}

const WIDTH = 400;
const HEIGHT = 140;
const PAD_X = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 8;

export function TrendLineChart({ points, color = 'var(--color-accent)', highlightColor = 'var(--color-income)' }: Props) {
  if (points.length === 0) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = points.map((point, index) => {
    const x = points.length === 1 ? WIDTH / 2 : (index / (points.length - 1)) * (WIDTH - PAD_X * 2) + PAD_X;
    const y = HEIGHT - PAD_BOTTOM - ((point.value - min) / range) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
    return { x, y };
  });

  const linePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPoints = `${coords[0].x.toFixed(1)},${HEIGHT} ${linePoints} ${coords[coords.length - 1].x.toFixed(1)},${HEIGHT}`;

  const first = points[0];
  const last = points[points.length - 1];

  return (
    <div className="trend-line-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        {coords.length > 1 && (
          <>
            <polygon points={areaPoints} fill={color} opacity="0.12" />
            <polyline
              points={linePoints}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {coords.map((c, index) => (
          <circle
            key={index}
            cx={c.x}
            cy={c.y}
            r={points[index].highlighted ? 6 : 3.5}
            fill={points[index].highlighted ? highlightColor : color}
            stroke={points[index].highlighted ? 'white' : 'none'}
            strokeWidth={points[index].highlighted ? 2 : 0}
          />
        ))}
      </svg>

      <div className="trend-line-chart__edges">
        <span className="trend-line-chart__edge-label">
          {first.dateLabel} · {first.valueLabel}
        </span>
        {points.length > 1 && (
          <span className="trend-line-chart__edge-label trend-line-chart__edge-label--end">
            {last.dateLabel} · {last.valueLabel}
          </span>
        )}
      </div>
    </div>
  );
}

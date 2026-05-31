const CATEGORY_COLORS = {
  study: "#F4ECC8",
  exercise: "#D4E4F1",
  meeting: "#CFD6C6",
  work: "#EEDBDF",
};

const getArcPoint = (radius, angle) => ({
  x: radius * Math.cos(angle),
  y: radius * Math.sin(angle),
});

const getSectorPath = (radius, startAngle, endAngle) => {
  const start = getArcPoint(radius, startAngle);
  const end = getArcPoint(radius, endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M 0 0 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
};

const getArcPath = (radius, startAngle, endAngle) => {
  const start = getArcPoint(radius, startAngle);
  const end = getArcPoint(radius, endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

export default function Ring({ schedules, className }) {
  const counts = {};

  schedules.forEach((schedule) => {
    counts[schedule.category] = (counts[schedule.category] || 0) + 1;
  });

  const total = schedules.length;

  const strokeWidth = 24;
  const radius = 106;
  const gapLength = 36;
  const entries = Object.entries(counts);
  const firstPercent = entries.length > 0 ? entries[0][1] / total : 0;
  const firstAngle = firstPercent * 2 * Math.PI;
  const gapAngle = gapLength / radius;
  const sectorExtraAngle = 0.12;
  const sectorStartAngle = -firstAngle / 2 + gapAngle / 2 - sectorExtraAngle;
  const sectorEndAngle = firstAngle / 2 - gapAngle / 2 + sectorExtraAngle;
  const sectorPath =
    sectorEndAngle > sectorStartAngle
      ? getSectorPath(radius, sectorStartAngle, sectorEndAngle)
      : "";

  let offset = -firstAngle / 2;

  return (
    <svg className={className} width="280" height="280">
      <g transform="translate(140,140) rotate(-90)">
        {sectorPath && (
          <path
            d={sectorPath}
            fill={CATEGORY_COLORS[entries[0][0]]}
            opacity="0.35"
          />
        )}
        {entries.map(([category, count]) => {
          const percent = count / total;
          const angle = percent * 2 * Math.PI;
          const startAngle = offset + gapAngle / 2;
          const endAngle = offset + angle - gapAngle / 2;
          const arcPath =
            endAngle > startAngle
              ? getArcPath(radius, startAngle, endAngle)
              : "";

          if (!arcPath) {
            offset += angle;
            return null;
          }

          const arc = (
            <path
              key={category}
              d={arcPath}
              fill="none"
              stroke={CATEGORY_COLORS[category]}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );

          offset += angle;

          return arc;
        })}
      </g>
    </svg>
  );
}

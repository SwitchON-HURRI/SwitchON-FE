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
  if (!schedules || schedules.length === 0) return null;

  const total = schedules.length;
  const strokeWidth = 24;
  const radius = 106;
  const gapLength = 36;
  const gapAngle = gapLength / radius;
  const anglePerBlock = (2 * Math.PI) / total;

  const sectorExtraAngle = 0.12;
  const sectorStartAngle = -anglePerBlock / 2 + gapAngle / 2 - sectorExtraAngle;
  const sectorEndAngle = anglePerBlock / 2 - gapAngle / 2 + sectorExtraAngle;
  const sectorPath =
    sectorEndAngle > sectorStartAngle
      ? getSectorPath(radius, sectorStartAngle, sectorEndAngle)
      : "";

  return (
    <svg className={className} width="280" height="280">
      <g transform="translate(140,140) rotate(-90)">
        {sectorPath && (
          <path
            d={sectorPath}
            fill={schedules[0].categoryColor}
            opacity="0.35"
          />
        )}
        {schedules.map((block, index) => {
          // 1번: 12시 중심으로 펼침 (-anglePerBlock/2 ~ +anglePerBlock/2)
          // 2번부터: 반시계 방향으로 이어짐
          const blockStart =
            -anglePerBlock / 2 - (index > 0 ? index * anglePerBlock : 0);
          const startAngle = blockStart + gapAngle / 2;
          const endAngle = blockStart + anglePerBlock - gapAngle / 2;
          const arcPath =
            endAngle > startAngle
              ? getArcPath(radius, startAngle, endAngle)
              : "";

          if (!arcPath) return null;

          return (
            <path
              key={block.todayScheduleId}
              d={arcPath}
              fill="none"
              stroke={block.categoryColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </svg>
  );
}

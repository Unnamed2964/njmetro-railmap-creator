import type { CSSProperties } from 'react';
import type { GeneratorState } from '../features/generatorSlice';

type CurrentStationBadgeProps = {
  data: GeneratorState;
};

const width = 3322;
const height = 800;

const zhTextStyle = (letterSpacing?: number): CSSProperties => ({
  fontFamily: 'Microsoft YaHei UI, Microsoft YaHei, sans-serif',
  fill: '#000000',
  letterSpacing: letterSpacing !== undefined ? `${letterSpacing}px` : undefined,
});

const enTextStyle = (letterSpacing?: number): CSSProperties => ({
  fontFamily: 'Segoe UI, Arial, sans-serif',
  fill: '#000000',
  letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
});

const getZhNameCondenseConfig = (name: string) => {
  if (name.length >= 14) {
    return {
      letterSpacing: 0,
      scaleX: 0.5,
    };
  }

  if (name.length >= 7) {
    return {
      letterSpacing: 0,
      scaleX: 0.8,
    };
  }

  return {
    letterSpacing: 13,
    scaleX: 1,
  };
};

const getCenteredScaleTransform = (centerX: number, scaleX: number) =>
  scaleX === 1 ? undefined : `translate(${centerX * (1 - scaleX)} 0) scale(${scaleX},1)`;

export function CurrentStationBadge({ data }: CurrentStationBadgeProps) {
  const { stnList, currentStnId, idColor } = data;
  const currentStation = stnList.find((station) => station.id === currentStnId) ?? stnList[0] ?? null;
  const zhNameCondenseConfig = getZhNameCondenseConfig(currentStation?.chName ?? '');
  const safeStation = currentStation ?? {
    chName: '不存在或未定义',
    enName: 'Bucunzai Huo Weidingyi',
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="badge-svg" role="img" aria-label="当前站贴纸">
      <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
      <rect x="0" y="642.5" width={width} height="157.5" fill={idColor} />

      <text
        x={width / 2}
        y="336"
        textAnchor="middle"
        fontSize="246px"
        style={zhTextStyle(zhNameCondenseConfig.letterSpacing)}
        transform={getCenteredScaleTransform(width / 2, zhNameCondenseConfig.scaleX)}
      >
        {safeStation.chName}
      </text>
      <text x={width / 2} y="508.5" textAnchor="middle" fontSize="117px" style={enTextStyle(3)}>
        {safeStation.enName.toUpperCase()}
      </text>
    </svg>
  );
}

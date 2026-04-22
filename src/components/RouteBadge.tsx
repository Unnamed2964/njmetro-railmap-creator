import type { CSSProperties } from 'react';
import type { GeneratorState, StationItem, TransferLine } from '../features/generatorSlice';
import { LineIdBadge, getLineIdBadgeWidth } from './LineIdBadge';
import { useSvgPositioner } from './svgPositioning';

type RouteBadgeProps = {
  data: GeneratorState;
};

const zhTextStyle = (letterSpacing?: number, fill = '#000000'): CSSProperties => ({
  fontFamily: 'Microsoft YaHei UI, Microsoft YaHei, sans-serif',
  fill,
  letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
});

const enTextStyle = (letterSpacing?: number, fill = '#000000'): CSSProperties => ({
  fontFamily: 'Segoe UI, Arial, sans-serif',
  fill,
  letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
});

const width = 7412;
const height = 800;
const lineCenterY = 315.75;
const lineThickness = 46;
const smallStationRadius = 17;
const endStationRadius = 33.5;
const endStationInnerRadius = 25.5;
const currentOuterRadius = 37.5;
const currentInnerRadius = 28;
const topLabelGap = 11;
const bottomLabelGap = 11;
const topTransferGap = 130.25;
const bottomTransferGap = 142.75;
const currentCardConnectorHeight = 36.75;
const currentCardGap = 12.5;

const StationAnchorPoint = () => <rect x="-0.5" y="-0.5" width="1" height="1" fill="transparent" />;

const RouteLineSegment = ({ color, width: segmentWidth }: { color: string; width: number }) => (
  <rect x="0" y={-lineThickness / 2} width={segmentWidth} height={lineThickness} fill={color} />
);

const RouteLineReference = ({ width: segmentWidth }: { width: number }) => (
  <rect x="0" y={-lineThickness / 2} width={segmentWidth} height={lineThickness} fill="transparent" />
);

const EndStationMarker = ({ fill }: { fill: string }) => (
  <g>
    <circle cx="0" cy="0" r={endStationRadius} fill={fill} />
    <circle cx="0" cy="0" r={endStationInnerRadius} fill="#ffffff" />
  </g>
);

const StationMarker = () => <circle cx="0" cy="0" r={smallStationRadius} fill="#ffffff" />;

const CurrentStationMarker = () => (
  <g>
    <circle cx="0" cy="0" r={currentOuterRadius} fill="#ff0000" />
    <circle cx="0" cy="0" r={currentInnerRadius} fill="#ffffff" />
  </g>
);

const TransferBadgeGroup = ({ lines }: { lines: TransferLine[] }) => {
  const gap = 12.5;
  const badgeHeight = 68.5;
  const supportedLines = lines
    .map((line) => ({ line, width: getLineIdBadgeWidth(line.id, badgeHeight) }))
    .filter((entry): entry is { line: TransferLine; width: number } => entry.width !== null);
  const widths = supportedLines.map((entry) => entry.width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(supportedLines.length - 1, 0);
  let cursorX = -totalWidth / 2;

  return (
    <g>
      {supportedLines.map(({ line, width }, index) => {
        const x = cursorX;
        cursorX += width + gap;

        return (
          <g key={`${line.id}-${line.color}-${index}`}>
            <g transform={`translate(${x} 0)`}>
              <LineIdBadge lineId={line.id} color={line.color} height={badgeHeight} />
            </g>
          </g>
        );
      })}
    </g>
  );
};

const StationTextBlock = ({ station }: { station: StationItem }) => {
  return (
    <g>
      <text x="0" y="51" textAnchor="middle" fontSize="51px" style={zhTextStyle(4)}>
        {station.chName}
      </text>
      <text x="0" y="80" textAnchor="middle" fontSize="20px" style={enTextStyle(1.2)}>
        {station.enName.toUpperCase()}
      </text>
    </g>
  );
};

const CurrentStationCard = ({ station }: { station: StationItem }) => {
  const cardWidth = Math.max(station.chName.length * 53 + 64, station.enName.length * 18 + 64, 229.5);
  const cardHeight = 89.5;
  const cardX = -cardWidth / 2;
  const cardY = currentCardConnectorHeight;
  const textColor = '#ffffff';

  return (
    <g>
      <rect x="-7.75" y="0" width="15.5" height={currentCardConnectorHeight} fill="#142966" />
      <rect x={cardX} y={cardY} width={cardWidth} height={cardHeight} rx="16.5" fill="#142966" />
      <text x="0" y={cardY + 45.5} textAnchor="middle" fontSize="51px" style={zhTextStyle(3, textColor)}>
        {station.chName}
      </text>
      <text x="0" y={cardY + 74.5} textAnchor="middle" fontSize="20px" style={enTextStyle(1, textColor)}>
        {station.enName.toUpperCase()}
      </text>
    </g>
  );
};

export function RouteBadge({ data }: RouteBadgeProps) {
  const { currentStnId, direction, idColor, totalLength, stnList } = data;
  const { anchor } = useSvgPositioner(width, height);
  const currentIndex = stnList.findIndex((station) => station.id === currentStnId);
  const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;
  const endpointIndices = stnList.length > 0 ? [...new Set([0, stnList.length - 1])] : [];
  const segmentCount = Math.max(stnList.length - 1, 0);
  const lineLength = Math.max(0, totalLength);
  const stnDis = segmentCount === 0 ? 0 : lineLength / segmentCount;
  const inactiveColor = '#d9d9d9';
  const activeSegmentWidth = direction === 'l' ? safeCurrentIndex * stnDis : (stnList.length - 1 - safeCurrentIndex) * stnDis;
  const inactiveSegmentWidth = Math.max(0, lineLength - activeSegmentWidth);
  const lineCenterYOffset = lineCenterY - height / 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="badge-svg" role="img" aria-label="线路牌">
      <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
      <rect x="0" y="642.5" width={width} height="157.5" fill={idColor} />

      {anchor('station-point-0', <StationAnchorPoint />, {
        centerX: -lineLength / 2,
        centerY: lineCenterYOffset,
      })}

      {stnList.slice(1).map((station, index) =>
        anchor(`station-point-${index + 1}`, <StationAnchorPoint />, {
          centerX: { to: `station-point-${index}`, offset: stnDis },
          centerY: { to: `station-point-${index}`, offset: 0 },
        }),
      )}

      {anchor('route-line-reference', <RouteLineReference width={lineLength} />, {
        left: { to: 'station-point-0', edge: 'left', gap: 0.5 },
        centerY: { to: 'station-point-0', offset: 0 },
      })}

      {activeSegmentWidth > 0
        ? anchor('route-line-active', <RouteLineSegment color={idColor} width={activeSegmentWidth} />, {
            left:
              direction === 'l'
                ? { to: 'station-point-0', edge: 'left', gap: 0.5 }
                : { to: `station-point-${safeCurrentIndex}`, edge: 'left', gap: 0.5 },
            centerY: { to: 'station-point-0', offset: 0 },
          })
        : null}

      {inactiveSegmentWidth > 0
        ? anchor('route-line-inactive', <RouteLineSegment color={inactiveColor} width={inactiveSegmentWidth} />, {
            left:
              direction === 'l'
                ? { to: `station-point-${safeCurrentIndex}`, edge: 'left', gap: 0.5 }
                : { to: 'station-point-0', edge: 'left', gap: 0.5 },
            centerY: { to: 'station-point-0', offset: 0 },
          })
        : null}

      {endpointIndices.map((index) => {
        if (index === safeCurrentIndex) {
          return null;
        }

        const fill = index === 0 ? (direction === 'l' ? idColor : inactiveColor) : direction === 'l' ? inactiveColor : idColor;

        return anchor(`station-end-${index}`, <EndStationMarker fill={fill} />, {
          centerX: { to: `station-point-${index}`, offset: 0 },
          centerY: { to: `station-point-${index}`, offset: 0 },
        });
      })}

      {stnList.map((station, index) => {
        const isCurrent = index === safeCurrentIndex;
        const isEndpoint = index === 0 || index === stnList.length - 1;
        const placeAbove = index % 2 === 0;
        const stationPointId = `station-point-${index}`;
        const stationMarkerId = isCurrent ? `station-current-${index}` : isEndpoint ? `station-end-${index}` : `station-marker-${index}`;

        return (
          <g key={station.id}>
            {!isCurrent && !isEndpoint
              ? anchor(stationMarkerId, <StationMarker />, {
                  centerX: { to: stationPointId, offset: 0 },
                  centerY: { to: stationPointId, offset: 0 },
                })
              : null}

            {isCurrent
              ? anchor(stationMarkerId, <CurrentStationMarker />, {
                  centerX: { to: stationPointId, offset: 0 },
                  centerY: { to: stationPointId, offset: 0 },
                })
              : null}

            {isCurrent
              ? anchor(`current-station-card-${index}`, <CurrentStationCard station={station} />, {
                  centerX: { to: stationMarkerId, offset: 0 },
                  top: { to: stationMarkerId, edge: 'bottom', gap: 0 },
                })
              : anchor(`station-label-${index}`, <StationTextBlock station={station} />, {
                  centerX: { to: stationPointId, offset: 0 },
                  ...(placeAbove
                    ? { bottom: { to: 'route-line-reference', edge: 'top', gap: topLabelGap } }
                    : { top: { to: 'route-line-reference', edge: 'bottom', gap: bottomLabelGap } }),
                })}

            {station.transfer.length > 0
              ? isCurrent
                ? anchor(`station-transfer-${index}`, <TransferBadgeGroup lines={station.transfer} />, {
                    centerX: { to: `current-station-card-${index}`, offset: 0 },
                    top: { to: `current-station-card-${index}`, edge: 'bottom', gap: currentCardGap },
                  })
                : anchor(`station-transfer-${index}`, <TransferBadgeGroup lines={station.transfer} />, {
                    centerX: { to: `station-label-${index}`, offset: 0 },
                    ...(placeAbove
                      ? { bottom: { to: `station-label-${index}`, edge: 'top', gap: currentCardGap } }
                      : { top: { to: `station-label-${index}`, edge: 'bottom', gap: currentCardGap } }),
                  })
              : null}
          </g>
        );
      })}
    </svg>
  );
}

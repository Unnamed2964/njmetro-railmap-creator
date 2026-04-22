import type { GeneratorState } from "../features/generatorSlice";
import { BadgePlaceholder } from "./BadgePlaceholder";

type DirectionBadgeProps = {
  data: GeneratorState;
};

export function DirectionBadge({ data }: DirectionBadgeProps) {
  const { stnList, currentStnId, direction, idColor } = data;

  const width = 3972,
    height = 800;

  const undirectedArrow = (
    <path
      d="m 145.5,0 h 71 L 99.5,119 H 340 v 55 H 100 l 120.5,120.5 h -74 L 0,148 Z"
      fill="black"
    />
  );

  const whiteBackground = (
    <rect
      id="white-background"
      x="0"
      y="0"
      width={width}
      height={height}
      fill="white"
    />
  );

  const buttonLine = (
    <rect
      id="button-line"
      x="0.0"
      y={height - 157.5}
      width={width}
      height="157.5"
      fill={idColor}
    />
  );

  const lineBadge = (
    <rect x="592.0" y="218.0" width="153.5" height="297.5" fill={idColor} />
  );

  const nextStation =
    direction === "r"
      ? stnList.find((stn) => stn.id === currentStnId)
      : stnList.find((stn) => stn.id === currentStnId);

  const toStation =
    direction === "r" ? stnList[stnList.length - 1] : stnList[0];

  const toBadge = (
    <>
      <text
        font-family="Microsoft YaHei"
        font-size="115.5px"
        x="827.5"
        y="433.5"
      >
        往
      </text>
      <text
        font-family="Microsoft YaHei"
        font-size="195.5px"
        x="1035.5"
        y="381.0"
        style={{ letterSpacing: "11.0px" }}
      >
        {toStation?.chName ?? "不存在或未定义"}
      </text>
      <text font-family="FZHei-B01" font-size="55.5px" x="837.5" y="516.5">
        To
      </text>
      <text
        font-family="FZHei-B01"
        font-size="82.5px"
        x="1033.0"
        y="516.5"
        style={{ letterSpacing: "4.5px" }}
      >
        {toStation?.enName.toUpperCase() ?? "BUCUNZAI HUO WEIDINGYI"}
      </text>
    </>
  );

  const nextBadge = (
    <>
      <text
        font-family="Microsoft YaHei"
        font-size="115.5px"
        x="2707.0"
        y="435.5"
        style={{ letterSpacing: "8.0px" }}
      >
        下一站
      </text>
      <text
        font-family="Microsoft YaHei"
        font-size="195.5px"
        x="3186.5"
        y="382.5"
        style={{ letterSpacing: "10.5px" }}
      >
        {nextStation?.chName ?? "不存在或未定义"}
      </text>
      <text
        font-family="FZHei-B01"
        font-size="55.5px"
        x="2718.5"
        y="519.0"
        style={{ letterSpacing: "3.5px" }}
      >
        Next Station
      </text>
      <text
        font-family="FZHei-B01"
        font-size="82.5px"
        x="3186.0"
        y="518.0"
        style={{ letterSpacing: "0.5px" }}
      >
        {nextStation?.enName.toUpperCase() ?? "BUCUNZAI HUO WEIDINGYI"}
      </text>
    </>
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="badge-svg" role="img" aria-label="方向牌">
        {whiteBackground}
        {buttonLine}
        <g id="arrow" transform="translate(171, 219) rotate(0)">{undirectedArrow}</g>
        {lineBadge}
        {toBadge}
        {nextBadge}
    </svg>
  );
}

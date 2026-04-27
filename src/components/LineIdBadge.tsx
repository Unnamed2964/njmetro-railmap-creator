import { sansLatinFontStack } from '../fontStacks';

type LineIdBadgeProps = {
  lineId: string;
  color: string;
  height: number;
};

type SupportedBadgeTemplate =
  | {
      kind: 'n';
      width: number;
      digit: string;
    }
  | {
      kind: '11';
      width: number;
    }
  | {
      kind: '1n';
      width: number;
      digit: string;
    }
  | {
      kind: 'Sn';
      width: number;
      digit: string;
    };

const baseHeight = 1000;

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const resolveBadgeTemplate = (lineId: string): SupportedBadgeTemplate | null => {
  if (/^[0-9]$/.test(lineId)) {
    return { kind: 'n', width: 500, digit: lineId };
  }

  if (lineId === '11') {
    return { kind: '11', width: 1000 };
  }

  if (/^1\d$/.test(lineId)) {
    return { kind: '1n', width: 1000, digit: lineId[1] };
  }

  if (/^S[0-9]$/.test(lineId)) {
    return { kind: 'Sn', width: 1000, digit: lineId[1] };
  }

  return null;
};

export const getLineIdBadgeWidth = (lineId: string, height: number) => {
  const template = resolveBadgeTemplate(lineId);

  if (!template) {
    return null;
  }

  return (template.width / baseHeight) * height;
};

// use href so that the SVG can be embedded as an image and the bbox can be properly calculated based on the image's width and height,
// avoiding number and characher enlarging the SVG's bbox when the SVG is directly embedded as XML in the main SVG, which causes incorrect vertical layout.
const buildBadgeSvg = (template: SupportedBadgeTemplate, color: string) => {
  const escapedLatinFontStack = escapeXml(sansLatinFontStack);
  const textStyle1000 = `font-size:1000px;font-family:${escapedLatinFontStack};fill:#ffffff`;
  const textStyle950 = `font-size:950px;font-family:${escapedLatinFontStack};fill:#ffffff`;

  switch (template.kind) {
    case 'n':
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${template.width}" height="${baseHeight}" viewBox="0 0 ${template.width} ${baseHeight}">
  <rect width="${template.width}" height="${baseHeight}" fill="${escapeXml(color)}" />
  <text style="${textStyle1000}" x="75" y="850" transform="scale(0.73,1)">${escapeXml(template.digit)}</text>
</svg>`;
    case '11':
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${template.width}" height="${baseHeight}" viewBox="0 0 ${template.width} ${baseHeight}">
  <rect width="${template.width}" height="${baseHeight}" fill="${escapeXml(color)}" />
  <text style="${textStyle1000}" x="535" y="850" transform="scale(0.95,1)">1</text>
  <text style="${textStyle1000}" x="85" y="850" transform="scale(0.95,1)">1</text>
</svg>`;
    case '1n':
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${template.width}" height="${baseHeight}" viewBox="0 0 ${template.width} ${baseHeight}">
  <rect width="${template.width}" height="${baseHeight}" fill="${escapeXml(color)}" />
  <text style="${textStyle1000}" x="75" y="850" transform="scale(0.73,1)">1</text>
  <text style="${textStyle1000}" x="650" y="850" transform="scale(0.73,1)">${escapeXml(template.digit)}</text>
</svg>`;
    case 'Sn':
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${template.width}" height="${baseHeight}" viewBox="0 0 ${template.width} ${baseHeight}">
  <rect width="${template.width}" height="${baseHeight}" fill="${escapeXml(color)}" />
  <text style="${textStyle950}" x="58" y="840" transform="scale(0.81,1)">S</text>
  <text style="${textStyle1000}" x="760" y="850" transform="scale(0.73,1)">${escapeXml(template.digit)}</text>
</svg>`;
  }
};

export function LineIdBadge({ lineId, color, height }: LineIdBadgeProps) {
  const template = resolveBadgeTemplate(lineId);

  if (!template) {
    return null;
  }

  const scale = height / baseHeight;
  const imageHref = `data:image/svg+xml;utf8,${encodeURIComponent(buildBadgeSvg(template, color))}`;

  return (
    <image href={imageHref} width={template.width} height={baseHeight} transform={`scale(${scale})`} />
  );
}
import type { GeneratorState } from '../features/generatorSlice';
import { BadgePlaceholder } from './BadgePlaceholder';

type CurrentStationBadgeProps = {
  data: GeneratorState;
};

export function CurrentStationBadge({ data }: CurrentStationBadgeProps) {
  return <BadgePlaceholder title="CurrentStationBadge" description="当前站贴纸组件骨架，后续在这里绘制正式版 SVG。" data={data} />;
}

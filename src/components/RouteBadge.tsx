import type { GeneratorState } from '../features/generatorSlice';
import { BadgePlaceholder } from './BadgePlaceholder';

type RouteBadgeProps = {
  data: GeneratorState;
};

export function RouteBadge({ data }: RouteBadgeProps) {
  return <BadgePlaceholder title="RouteBadge" description="线路贴纸组件骨架，后续在这里绘制正式版 SVG。" data={data} />;
}

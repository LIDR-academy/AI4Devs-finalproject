import { Product } from '../../types';
import {
  LEVEL_CONFIG,
  DISTANCE_LABELS,
  SURFACE_LABELS,
  OBJECTIVE_LABELS,
} from '../../lib/product-utils';

type Props = {
  product: Pick<Product, 'level' | 'distance' | 'surface' | 'objective'>;
};

const BADGE_BASE = 'text-xs font-medium px-2.5 py-1 rounded-full';
const NEUTRAL_BG = 'bg-gray-100 text-gray-700';

function AttributeGroup({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => (
        <span key={label} className={`${BADGE_BASE} ${NEUTRAL_BG}`}>
          {label}
        </span>
      ))}
    </div>
  );
}

export function ProductAttributes({ product }: Props) {
  const { level, distance, surface, objective } = product;

  const hasContent =
    level.length > 0 || distance.length > 0 || surface.length > 0 || objective.length > 0;

  if (!hasContent) return null;

  return (
    <div className="flex flex-col gap-2" data-testid="product-attributes">
      {level.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {level.map((l) => {
            const config = LEVEL_CONFIG[l];
            if (!config) return null;
            return (
              <span key={l} className={`${BADGE_BASE} ${config.bg} ${config.text}`}>
                {config.label}
              </span>
            );
          })}
        </div>
      )}

      <AttributeGroup labels={distance.map((d) => DISTANCE_LABELS[d] ?? d)} />
      <AttributeGroup labels={surface.map((s) => SURFACE_LABELS[s] ?? s)} />
      <AttributeGroup labels={objective.map((o) => OBJECTIVE_LABELS[o] ?? o)} />
    </div>
  );
}

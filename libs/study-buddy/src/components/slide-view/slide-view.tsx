import { SlideView as SlideViewOrganism, type SlideViewProps } from '@helsoft/activities';

export type { SlideViewProps };

/** Thin feature wiring — organism owns slide rendering. */
export const SlideView = (props: SlideViewProps) => <SlideViewOrganism {...props} />;

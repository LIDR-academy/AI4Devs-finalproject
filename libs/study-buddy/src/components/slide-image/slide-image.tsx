import { SlideImage as SlideImageOrganism, type SlideImageProps } from '@helsoft/activities';

export type { SlideImageProps };

/** Thin feature wiring — organism owns signed-URL image rendering. */
export const SlideImage = (props: SlideImageProps) => <SlideImageOrganism {...props} />;

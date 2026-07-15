export type NavIndicatorVariant = 'pill' | 'underline' | 'dot';

export type NavItemProps = {
  label: string;
  active?: boolean;
  indicatorVariant?: NavIndicatorVariant;
  onPress: () => void;
};

import { Product } from '../../types';

type Props = {
  product: Pick<Product, 'level' | 'distance' | 'surface' | 'objective'>;
};

export function ProductAttributes({ product: _ }: Props) {
  return null;
}

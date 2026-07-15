import { render, screen } from '@testing-library/react-native';

import { layout } from '../../theme';
import { NavItem } from './nav-item';

describe('NavItem', () => {
  it('uses the pill indicator by default for an active destination', async () => {
    await render(<NavItem label="Home" active onPress={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'Home' }).props.accessibilityState).toEqual({
      selected: true,
    });
    expect(screen.getByTestId('nav-item-indicator-pill')).toBeOnTheScreen();
  });

  it('provides a theme-sized touch target', async () => {
    await render(<NavItem label="Home" onPress={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'Home' }).props.style).toMatchObject({
      minHeight: layout.touchTarget,
      minWidth: layout.touchTarget,
    });
  });

  it.each([
    'pill',
    'underline',
    'dot',
  ] as const)('renders the %s active indicator variant', async (indicatorVariant) => {
    await render(
      <NavItem label="New lesson" active indicatorVariant={indicatorVariant} onPress={jest.fn()} />,
    );

    const indicator = screen.getByTestId(`nav-item-indicator-${indicatorVariant}`);

    expect(indicator.props.style).toMatchObject({
      position: indicatorVariant === 'pill' ? 'absolute' : 'relative',
    });
  });
});

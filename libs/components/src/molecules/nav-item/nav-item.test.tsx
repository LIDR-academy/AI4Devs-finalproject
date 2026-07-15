import { render, screen } from '@testing-library/react-native';

import { layout } from '../../theme';
import { NavItem } from './nav-item';

describe('NavItem', () => {
  it('uses the pill indicator by default for an active destination', async () => {
    await render(<NavItem label="Home" active onPress={jest.fn()} />);

    const item = screen.getByRole('link', { name: 'Home' });
    expect(item.props.accessibilityState).toEqual({
      selected: true,
    });
    expect(item.props.style).toMatchObject({
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    });
    expect(item.props.style.backgroundColor).not.toBe('transparent');
    expect(screen.getByTestId('nav-item-indicator-pill')).toBeOnTheScreen();
  });

  it('provides a theme-sized touch target', async () => {
    await render(<NavItem label="Home" onPress={jest.fn()} />);

    const item = screen.getByRole('link', { name: 'Home' });
    expect(item.props.accessibilityState).toEqual({ selected: false });
    expect(item.props.style).toMatchObject({
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
    if (indicatorVariant === 'underline') {
      expect(indicator.props.style).toMatchObject({
        alignSelf: 'stretch',
        backgroundColor: expect.any(String),
      });
    }
    if (indicatorVariant === 'dot') {
      expect(indicator.props.style).toMatchObject({
        height: expect.any(Number),
        width: expect.any(Number),
      });
      expect(indicator.props.style.alignSelf).toBeUndefined();
    }
  });

  it('uses pill background and label colors only for an active pill', async () => {
    const { rerender } = await render(
      <NavItem label="Home" active indicatorVariant="pill" onPress={jest.fn()} />,
    );

    expect(screen.getByRole('link', { name: 'Home' }).props.style.backgroundColor).not.toBe(
      'transparent',
    );
    expect(screen.getByText('Home').props.style.color).toEqual(expect.any(String));

    await rerender(<NavItem label="Home" active indicatorVariant="dot" onPress={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'Home' }).props.style.backgroundColor).toBe(
      'transparent',
    );
  });
});

jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useLocalization } from '@helsoft/localization';
import { render, screen } from '@testing-library/react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { PLAYER_LOADING_TEST_ID, PlayerLoading } from './player-loading';

const mockUseLocalization = useLocalization as jest.Mock;

describe('PlayerLoading', () => {
  beforeEach(() => {
    mockUseLocalization.mockReturnValue(
      localizationValue({
        t: (key: string) => (key === 'player.loading' ? 'Loading lesson…' : key),
      }),
    );
  });

  // @s17 — loading chrome with a single named progressbar (no nested duplicate roles).
  it('renders one named progressbar and the loading label', async () => {
    await render(<PlayerLoading />);

    expect(screen.getByTestId(PLAYER_LOADING_TEST_ID)).toBeTruthy();
    expect(screen.getByText('Loading lesson…')).toBeTruthy();
    expect(screen.getByTestId(PLAYER_LOADING_TEST_ID).props.accessibilityRole).toBeUndefined();

    const bar = screen.getByLabelText('Loading lesson…');
    expect(bar.props.accessibilityRole).toBe('progressbar');
  });
});

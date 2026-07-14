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
    expect(PLAYER_LOADING_TEST_ID).toBe('player-loading-indicator');
    await render(<PlayerLoading />);

    expect(screen.getByTestId(PLAYER_LOADING_TEST_ID)).toBeTruthy();
    expect(screen.getByText('Loading lesson…')).toBeTruthy();
    expect(screen.getByTestId(PLAYER_LOADING_TEST_ID).props.accessibilityRole).toBeUndefined();

    const bar = screen.getByLabelText('Loading lesson…');
    expect(bar.props.accessibilityRole).toBe('progressbar');
  });

  // Mutation — label Text stays non-accessible; layout styles applied.
  it('keeps the visible label non-accessible and applies loading layout styles', async () => {
    await render(<PlayerLoading />);

    const root = screen.getByTestId(PLAYER_LOADING_TEST_ID);
    expect(root.props.style).toEqual(
      expect.objectContaining({
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }),
    );

    const label = screen.getByText('Loading lesson…');
    expect(label.props.accessible).toBe(false);
    expect(label.props.style).toEqual(
      expect.objectContaining({
        fontFamily: 'IBM Plex Sans',
        color: '#414950',
      }),
    );
  });
});

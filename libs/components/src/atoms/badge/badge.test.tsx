import { render, screen } from '@testing-library/react-native';

import { Badge } from './badge';

describe('Badge', () => {
  it('renders the count', async () => {
    await render(<Badge count={5} />);

    expect(screen.getByText('5')).toBeTruthy();
  });

  it('caps the count at max', async () => {
    await render(<Badge count={150} max={99} />);

    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('renders no text for a dot badge', async () => {
    await render(<Badge dot />);

    expect(screen.queryByText(/./)).toBeNull();
  });

  it('renders nothing when there is no count and it is not a dot', async () => {
    const { toJSON } = await render(<Badge />);

    expect(toJSON()).toBeNull();
  });
});

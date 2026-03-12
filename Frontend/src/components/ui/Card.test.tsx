import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with default padding', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-6');
  });

  it('renders with custom padding', () => {
    const { container } = render(<Card padding="sm">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-3');
  });

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(
      <CardHeader>
        <div>Header content</div>
      </CardHeader>
    );
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('has border bottom styling', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('border-b', 'border-gray-200');
  });
});

describe('CardTitle', () => {
  it('renders children', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('has title styling', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('text-lg', 'font-semibold', 'text-gray-900');
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Content</CardContent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(<CardContent className="custom-class">Content</CardContent>);
    expect(screen.getByText('Content')).toHaveClass('custom-class');
  });
});

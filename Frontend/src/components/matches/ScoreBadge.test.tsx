import React from 'react';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/config';
import ScoreBadge from './ScoreBadge';

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('ScoreBadge', () => {
  it('renders excellent score correctly', () => {
    renderWithI18n(<ScoreBadge score={0.9} />);
    
    expect(screen.getByText(/excelente/i)).toBeInTheDocument();
    expect(screen.getByText('(90%)')).toBeInTheDocument();
  });

  it('renders good score correctly', () => {
    renderWithI18n(<ScoreBadge score={0.7} />);
    
    expect(screen.getByText(/bueno/i)).toBeInTheDocument();
    expect(screen.getByText('(70%)')).toBeInTheDocument();
  });

  it('renders regular score correctly', () => {
    renderWithI18n(<ScoreBadge score={0.5} />);
    
    expect(screen.getByText(/regular/i)).toBeInTheDocument();
    expect(screen.getByText('(50%)')).toBeInTheDocument();
  });

  it('renders low score correctly', () => {
    renderWithI18n(<ScoreBadge score={0.3} />);
    
    expect(screen.getByText(/bajo/i)).toBeInTheDocument();
    expect(screen.getByText('(30%)')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = renderWithI18n(<ScoreBadge score={0.8} size="sm" />);
    expect(screen.getByText(/excelente/i)).toHaveClass('text-xs');

    rerender(<ScoreBadge score={0.8} size="lg" />);
    expect(screen.getByText(/excelente/i)).toHaveClass('text-sm');
  });

  it('hides percentage when showPercentage is false', () => {
    renderWithI18n(<ScoreBadge score={0.8} showPercentage={false} />);
    
    expect(screen.getByText(/excelente/i)).toBeInTheDocument();
    expect(screen.queryByText('(80%)')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    renderWithI18n(<ScoreBadge score={0.8} className="custom-class" />);
    
    const badge = screen.getByText(/excelente/i).closest('span');
    expect(badge).toHaveClass('custom-class');
  });

  it('has correct color classes for different scores', () => {
    const { rerender } = renderWithI18n(<ScoreBadge score={0.9} />);
    let badge = screen.getByText(/excelente/i).closest('span');
    expect(badge).toHaveClass('text-green-600', 'bg-green-100');

    rerender(<ScoreBadge score={0.7} />);
    badge = screen.getByText(/bueno/i).closest('span');
    expect(badge).toHaveClass('text-yellow-600', 'bg-yellow-100');

    rerender(<ScoreBadge score={0.5} />);
    badge = screen.getByText(/regular/i).closest('span');
    expect(badge).toHaveClass('text-orange-600', 'bg-orange-100');

    rerender(<ScoreBadge score={0.3} />);
    badge = screen.getByText(/bajo/i).closest('span');
    expect(badge).toHaveClass('text-red-600', 'bg-red-100');
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrutalistButton } from '../components/BrutalistButton';

describe('BrutalistButton', () => {
  it('renders with default variant', () => {
    render(<BrutalistButton>Click Me</BrutalistButton>);
    const button = screen.getByText('Click Me');
    expect(button).toBeInTheDocument();
  });

  it('applies primary variant styles', () => {
    render(<BrutalistButton variant="primary">Primary</BrutalistButton>);
    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-amber-300');
  });

  it('handles click events', () => {
    let clicked = false;
    render(<BrutalistButton onClick={() => { clicked = true; }}>Click</BrutalistButton>);
    const button = screen.getByText('Click');
    button.click();
    expect(clicked).toBe(true);
  });

  it('can be disabled', () => {
    render(<BrutalistButton disabled>Disabled</BrutalistButton>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });
});

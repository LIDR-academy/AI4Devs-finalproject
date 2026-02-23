import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
    it('renders without crashing', () => {
        render(<App />);
    });

    it('displays the application header', () => {
        render(<App />);
        const headerElement = screen.getByRole('heading', { name: /SC Padel Club/i });
        expect(headerElement).toBeInTheDocument();
    });

    it('displays welcome message', () => {
        render(<App />);
        const welcomeElement = screen.getByText(/Bienvenido a SC Padel Club/i);
        expect(welcomeElement).toBeInTheDocument();
    });

    it('renders header element', () => {
        render(<App />);
        const header = screen.getByRole('navigation');
        expect(header).toBeInTheDocument();
    });

    it('renders main content area', () => {
        const { container } = render(<App />);
        const mainContent = container.querySelector('.max-w-7xl');
        expect(mainContent).toBeInTheDocument();
    });

    it('has correct structure', () => {
        const { container } = render(<App />);
        const appDiv = container.querySelector('.min-h-screen');
        expect(appDiv).toBeInTheDocument();
    });
});

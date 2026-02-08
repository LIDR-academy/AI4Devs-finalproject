import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MusicSelectorButton } from '../MusicSelectorButton';

describe('MusicSelectorButton', () => {
  const mockOnAudioSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button with correct text', () => {
    render(<MusicSelectorButton onAudioSelected={mockOnAudioSelected} />);
    
    const button = screen.getByTestId('music-selector-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Select Local Audio');
  });

  it('renders hidden file input with correct accept attribute', () => {
    render(<MusicSelectorButton onAudioSelected={mockOnAudioSelected} />);
    
    const fileInput = screen.getByTestId('music-file-input') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept');
    expect(fileInput.accept).toContain('.mp3');
    expect(fileInput.accept).toContain('.wav');
    expect(fileInput.accept).toContain('.ogg');
    expect(fileInput.accept).toContain('.m4a');
  });

  it('triggers file input click when button is clicked', async () => {
    const user = userEvent.setup();
    render(<MusicSelectorButton onAudioSelected={mockOnAudioSelected} />);
    
    const fileInput = screen.getByTestId('music-file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');
    
    const button = screen.getByTestId('music-selector-button');
    await user.click(button);
    
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('calls onAudioSelected with valid audio file', async () => {
    const user = userEvent.setup();
    render(<MusicSelectorButton onAudioSelected={mockOnAudioSelected} />);
    
    const file = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' });
    const fileInput = screen.getByTestId('music-file-input') as HTMLInputElement;
    
    await user.upload(fileInput, file);
    
    expect(mockOnAudioSelected).toHaveBeenCalledTimes(1);
    expect(mockOnAudioSelected).toHaveBeenCalledWith(file);
  });

  it('accepts WAV files', async () => {
    const user = userEvent.setup();
    render(<MusicSelectorButton onAudioSelected={mockOnAudioSelected} />);
    
    const file = new File(['audio content'], 'test.wav', { type: 'audio/wav' });
    const fileInput = screen.getByTestId('music-file-input') as HTMLInputElement;
    
    await user.upload(fileInput, file);
    
    expect(mockOnAudioSelected).toHaveBeenCalledWith(file);
  });

  it('accepts OGG files', async () => {
    const user = userEvent.setup();
    render(<MusicSelectorButton onAudioSelected={mockOnAudioSelected} />);
    
    const file = new File(['audio content'], 'test.ogg', { type: 'audio/ogg' });
    const fileInput = screen.getByTestId('music-file-input') as HTMLInputElement;
    
    await user.upload(fileInput, file);
    
    expect(mockOnAudioSelected).toHaveBeenCalledWith(file);
  });

  it('accepts M4A files', async () => {
    const user = userEvent.setup();
    render(<MusicSelectorButton onAudioSelected={mockOnAudioSelected} />);
    
    const file = new File(['audio content'], 'test.m4a', { type: 'audio/x-m4a' });
    const fileInput = screen.getByTestId('music-file-input') as HTMLInputElement;
    
    await user.upload(fileInput, file);
    
    expect(mockOnAudioSelected).toHaveBeenCalledWith(file);
  });

  it('rejects files larger than 10MB with alert', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<MusicSelectorButton onAudioSelected={mockOnAudioSelected} />);
    
    // Create a 11MB file
    const largeFile = new File(
      [new ArrayBuffer(11 * 1024 * 1024)], 
      'large.mp3', 
      { type: 'audio/mpeg' }
    );
    const fileInput = screen.getByTestId('music-file-input') as HTMLInputElement;
    
    await user.upload(fileInput, largeFile);
    
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('File size exceeds 10MB limit')
    );
    expect(mockOnAudioSelected).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('rejects invalid file types with alert', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<MusicSelectorButton onAudioSelected={mockOnAudioSelected} />);
    
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('music-file-input') as HTMLInputElement;
    
    // Manually trigger the change event with the invalid file
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false,
    });
    
    const changeEvent = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(changeEvent);
    
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid file type')
    );
    expect(mockOnAudioSelected).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('resets file input after selection', async () => {
    const user = userEvent.setup();
    render(<MusicSelectorButton onAudioSelected={mockOnAudioSelected} />);
    
    const file = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' });
    const fileInput = screen.getByTestId('music-file-input') as HTMLInputElement;
    
    await user.upload(fileInput, file);
    
    // After handling the file, the input value should be reset
    expect(fileInput.value).toBe('');
  });

  it('does not call onAudioSelected when no file is selected', () => {
    render(<MusicSelectorButton onAudioSelected={mockOnAudioSelected} />);
    
    const fileInput = screen.getByTestId('music-file-input') as HTMLInputElement;
    
    // Simulate change event without files
    const event = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(event);
    
    expect(mockOnAudioSelected).not.toHaveBeenCalled();
  });
});

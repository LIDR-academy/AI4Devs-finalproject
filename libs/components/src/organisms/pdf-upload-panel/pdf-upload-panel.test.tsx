import { fireEvent, render, screen } from '@testing-library/react-native';

import { PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID, PdfUploadPanel } from './pdf-upload-panel';

const labels = {
  loading: 'Extracting…',
  chooseFile: 'Choose a PDF',
  filenameLabel: 'File',
  pageCountLabel: 'Pages',
  imageCountLabel: 'Images',
  continueLabel: 'Continue',
};

describe('PdfUploadPanel', () => {
  // Wiring precondition (task-8) — before any file is picked (usePdfExtraction's 'idle' stage),
  // the panel still has to render *something*: just the persistent choose-file control, enabled,
  // with no loading/content content shown. This is not the fuller Empty state (constraints hint
  // etc., AC7) — task-11 adds that behind its own failing tests.
  it('renders only the enabled choose-file control in the idle state', async () => {
    await render(<PdfUploadPanel state="idle" labels={labels} onChooseFile={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Choose a PDF', disabled: false })).toBeTruthy();
    expect(screen.queryByTestId(PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID)).toBeNull();
    expect(screen.queryByText('Extracting…')).toBeNull();
  });

  // @s5 — the Loading state renders an indeterminate progress affordance and disables the
  // choose-file control until the request resolves.
  it('renders an indeterminate progress indicator and loading copy in the loading state', async () => {
    await render(<PdfUploadPanel state="loading" labels={labels} onChooseFile={jest.fn()} />);

    expect(screen.getByTestId(PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID)).toBeTruthy();
    expect(screen.getByText('Extracting…')).toBeTruthy();
  });

  // @s5 — the choose-file control is disabled while loading, so the in-flight request can't be
  // interrupted by picking another file.
  it('disables the choose-file control in the loading state', async () => {
    await render(<PdfUploadPanel state="loading" labels={labels} onChooseFile={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Choose a PDF', disabled: true })).toBeTruthy();
  });

  // @s6 — the Content state renders the success summary: filename, page count, image count.
  it('renders the filename, page count, and image count in the content state', async () => {
    await render(
      <PdfUploadPanel
        state="content"
        labels={labels}
        onChooseFile={jest.fn()}
        filename="notes.pdf"
        pageCount={12}
        imageCount={3}
      />,
    );

    expect(screen.getByText('notes.pdf')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  // @s6 — the Content state exposes a continue affordance that invokes onContinue when pressed.
  it('calls onContinue when the continue affordance is pressed in the content state', async () => {
    const onContinue = jest.fn();
    await render(
      <PdfUploadPanel
        state="content"
        labels={labels}
        onChooseFile={jest.fn()}
        filename="notes.pdf"
        pageCount={12}
        imageCount={3}
        onContinue={onContinue}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  // The Content state does not show the loading affordance.
  it('does not render the loading indicator in the content state', async () => {
    await render(
      <PdfUploadPanel state="content" labels={labels} onChooseFile={jest.fn()} filename="notes.pdf" pageCount={1} imageCount={0} />,
    );

    expect(screen.queryByTestId(PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID)).toBeNull();
  });
});

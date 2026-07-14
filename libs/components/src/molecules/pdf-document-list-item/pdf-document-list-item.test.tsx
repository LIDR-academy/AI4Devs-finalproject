import { fireEvent, render, screen } from '@testing-library/react-native';

import { layout } from '../../theme/spacing';
import { PdfDocumentListItem } from './pdf-document-list-item';

/** Unistyles style fns may return nested/array styles under Jest — flatten for assertions. */
const flattenStyle = (style: unknown): Record<string, unknown> =>
  Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

const baseProps = {
  filename: 'notes.pdf',
  statusLabel: 'Ready to generate',
  createdDateLabel: 'Jul 14, 2026',
  pageCountLabel: '12 pages',
  generateLabel: 'Generate',
  retryLabel: 'Retry',
  openLessonLabel: 'Open lesson',
  generateAccessibilityLabel: 'Generate notes.pdf',
  retryAccessibilityLabel: 'Retry notes.pdf',
  openLessonAccessibilityLabel: 'Open lesson for notes.pdf',
  onGenerate: jest.fn(),
  onOpenLesson: jest.fn(),
};

describe('PdfDocumentListItem', () => {
  beforeEach(() => {
    baseProps.onGenerate = jest.fn();
    baseProps.onOpenLesson = jest.fn();
  });

  // @s1 — filename, status, date, page count.
  it('renders filename, status, created-date, and page-count labels', async () => {
    await render(<PdfDocumentListItem {...baseProps} status="ready" />);

    expect(screen.getByText('notes.pdf')).toBeTruthy();
    expect(screen.getByText('Ready to generate')).toBeTruthy();
    expect(screen.getByText('Jul 14, 2026')).toBeTruthy();
    expect(screen.getByText('12 pages')).toBeTruthy();
  });

  // @s2/@s5 — ready → Generate action.
  it('shows Generate and calls onGenerate when status is ready', async () => {
    await render(<PdfDocumentListItem {...baseProps} status="ready" />);

    fireEvent.press(screen.getByRole('button', { name: 'Generate notes.pdf' }));
    expect(baseProps.onGenerate).toHaveBeenCalledTimes(1);
    expect(baseProps.onOpenLesson).not.toHaveBeenCalled();
    expect(screen.getByText('Generate')).toBeTruthy();
  });

  // @s3/@s6 — failed → Retry action.
  it('shows Retry and calls onGenerate when status is failed', async () => {
    await render(
      <PdfDocumentListItem {...baseProps} status="failed" statusLabel="Generation failed" />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Retry notes.pdf' }));
    expect(baseProps.onGenerate).toHaveBeenCalledTimes(1);
    expect(baseProps.onOpenLesson).not.toHaveBeenCalled();
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  // @s4/@s7 — generated → Open lesson action.
  it('shows Open lesson and calls onOpenLesson when status is generated', async () => {
    await render(
      <PdfDocumentListItem {...baseProps} status="generated" statusLabel="Lesson ready" />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Open lesson for notes.pdf' }));
    expect(baseProps.onOpenLesson).toHaveBeenCalledTimes(1);
    expect(baseProps.onGenerate).not.toHaveBeenCalled();
    expect(screen.getByText('Open lesson')).toBeTruthy();
  });

  // @s11 — delete only for ready/failed when onDelete + label provided.
  it('renders delete for ready when onDelete and deleteAccessibilityLabel are set', async () => {
    const onDelete = jest.fn();
    await render(
      <PdfDocumentListItem
        {...baseProps}
        status="ready"
        onDelete={onDelete}
        deleteAccessibilityLabel="Delete notes.pdf"
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Delete notes.pdf' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('renders delete for failed when onDelete and deleteAccessibilityLabel are set', async () => {
    await render(
      <PdfDocumentListItem
        {...baseProps}
        status="failed"
        statusLabel="Generation failed"
        onDelete={jest.fn()}
        deleteAccessibilityLabel="Delete notes.pdf"
      />,
    );

    expect(screen.getByRole('button', { name: 'Delete notes.pdf' })).toBeTruthy();
  });

  it('hides delete when status is generated even if onDelete is provided', async () => {
    await render(
      <PdfDocumentListItem
        {...baseProps}
        status="generated"
        statusLabel="Lesson ready"
        onDelete={jest.fn()}
        deleteAccessibilityLabel="Delete notes.pdf"
      />,
    );

    expect(screen.queryByRole('button', { name: 'Delete notes.pdf' })).toBeNull();
  });

  it('hides delete when onDelete is missing', async () => {
    await render(
      <PdfDocumentListItem
        {...baseProps}
        status="ready"
        deleteAccessibilityLabel="Delete notes.pdf"
      />,
    );

    expect(screen.queryByRole('button', { name: 'Delete notes.pdf' })).toBeNull();
  });

  it('hides delete when deleteAccessibilityLabel is missing', async () => {
    await render(<PdfDocumentListItem {...baseProps} status="ready" onDelete={jest.fn()} />);

    expect(screen.queryByRole('button', { name: /Delete/i })).toBeNull();
  });

  // WCAG 2.5.5 — delete meets layout.touchTarget (48).
  it('sizes the delete control to the 48dp touch-target token', async () => {
    await render(
      <PdfDocumentListItem
        {...baseProps}
        status="ready"
        onDelete={jest.fn()}
        deleteAccessibilityLabel="Delete notes.pdf"
      />,
    );

    const flat = flattenStyle(screen.getByRole('button', { name: 'Delete notes.pdf' }).props.style);
    expect(flat.width).toBe(layout.touchTarget);
    expect(flat.height).toBe(layout.touchTarget);
  });

  // Mutation: emptied StyleSheet row/info/filename/meta/actions — layout tokens must remain.
  it('lays out the row and actions as horizontal centered flex rows', async () => {
    await render(<PdfDocumentListItem {...baseProps} status="ready" />);

    const filename = screen.getByText('notes.pdf');
    const filenameFlat = flattenStyle(filename.props.style);
    expect(filenameFlat.color).toBeTruthy();

    const status = screen.getByText('Ready to generate');
    expect(flattenStyle(status.props.style).color).toBeTruthy();

    // Walk up to the row container (info's parent).
    const infoParent = filename.parent?.parent;
    const rowFlat = flattenStyle(infoParent?.props?.style);
    expect(rowFlat.flexDirection).toBe('row');
    expect(rowFlat.alignItems).toBe('center');

    const actions = screen.getByRole('button', { name: 'Generate notes.pdf' }).parent;
    const actionsFlat = flattenStyle(actions?.props?.style);
    expect(actionsFlat.flexDirection).toBe('row');
    expect(actionsFlat.alignItems).toBe('center');
  });

  // Mutation: `info: {}` — info column must flex to fill remaining row space.
  it('gives the info column flex:1 so the action stays trailing', async () => {
    await render(<PdfDocumentListItem {...baseProps} status="ready" />);
    const info = screen.getByText('notes.pdf').parent;
    expect(flattenStyle(info?.props?.style).flex).toBe(1);
  });
});

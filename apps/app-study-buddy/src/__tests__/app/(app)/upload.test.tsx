import type { ReactNode } from 'react';

let mockCanCreate = false;
let mockPdfDocumentsProps: {
  onGenerate?: (documentId: string) => void;
};

jest.mock('@helsoft/components', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ScreenContainer: ({ children }: { children: ReactNode }) =>
      React.createElement(View, null, children),
  };
});

jest.mock('@helsoft/study-buddy', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    ApiKeyGate: ({ children }: { children: ReactNode }) => children,
    useApiKeyGateCanCreate: () => mockCanCreate,
    NewLessonDialog: () => React.createElement(Text, null, 'new-lesson-dialog'),
    PdfDocuments: (props: typeof mockPdfDocumentsProps) => {
      mockPdfDocumentsProps = props;
      return React.createElement(Text, null, 'pdf-documents');
    },
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import { render, screen } from '@testing-library/react-native';

import UploadScreen from '../../../app/(app)/upload';

describe('UploadScreen entitlements composition', () => {
  beforeEach(() => {
    mockCanCreate = false;
    mockPdfDocumentsProps = {};
  });

  // @s3/@s4/@s5 — unavailable creation removes both upload entry points.
  it('hides NewLessonDialog and omits onGenerate when creation is unavailable', async () => {
    await render(<UploadScreen />);

    expect(screen.queryByText('new-lesson-dialog')).toBeNull();
    expect(screen.getByText('pdf-documents')).toBeTruthy();
    expect(mockPdfDocumentsProps.onGenerate).toBeUndefined();
  });

  // @s2/@s9/@s17 — current entitlements expose both upload entry points.
  it('shows NewLessonDialog and supplies onGenerate when creation is available', async () => {
    mockCanCreate = true;

    await render(<UploadScreen />);

    expect(screen.getByText('new-lesson-dialog')).toBeTruthy();
    expect(screen.getByText('pdf-documents')).toBeTruthy();
    expect(mockPdfDocumentsProps.onGenerate).toEqual(expect.any(Function));
  });
});

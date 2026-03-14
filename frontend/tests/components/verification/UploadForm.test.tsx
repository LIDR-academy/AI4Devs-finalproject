/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UploadForm from '@/app/components/verification/UploadForm';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('UploadForm', () => {
  it('muestra error cuando no se selecciona archivo', async () => {
    render(<UploadForm isUploading={false} onSubmit={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'uploadButton' }));

    await waitFor(() => {
      expect(screen.getByText('errors.missingFile')).toBeInTheDocument();
    });
  });

  it('ejecuta onSubmit con archivo válido y tipo seleccionado', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<UploadForm isUploading={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('documentTypeLabel'), {
      target: { value: 'diploma' },
    });

    const input = screen.getByLabelText('fileLabel') as HTMLInputElement;
    const validFile = new File(['%PDF-1.4'], 'diploma.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(input, 'files', {
      value: [validFile],
      writable: false,
    });
    fireEvent.change(input);
    fireEvent.click(screen.getByRole('button', { name: 'uploadButton' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        file: validFile,
        documentType: 'diploma',
      });
    });
  });
});

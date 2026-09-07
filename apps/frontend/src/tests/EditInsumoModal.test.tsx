import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditInsumoModal } from '../features/stock/components/EditInsumoModal.js';
import { InsumoItem } from '../features/stock/services/stock.service.js';

const insumo: InsumoItem = {
  id: 'ins-1',
  name: 'Harina 00',
  unitOfMeasure: 'KG',
  warehouseStock: '5.000',
  unitCost: null,
  barcode: null,
};

describe('TK-130-FE: EditInsumoModal (US-036)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no renderiza nada cuando isOpen es false o no hay insumo', () => {
    const { container } = render(<EditInsumoModal isOpen={false} insumo={insumo} onClose={() => {}} onSuccess={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('precarga los campos y muestra la unidad como no editable', () => {
    render(<EditInsumoModal isOpen={true} insumo={insumo} onClose={() => {}} onSuccess={() => {}} />);
    expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe('Harina 00');
    expect(screen.getByText(/no editable/i)).toBeInTheDocument();
  });

  it('envía solo los campos que cambiaron (PUT con name + unitCost)', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => ({ ...insumo, name: "Harina 000", unitCost: "820.00" }) }));
    vi.stubGlobal('fetch', fetchMock);
    const onSuccess = vi.fn();

    render(<EditInsumoModal isOpen={true} insumo={insumo} onClose={() => {}} onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Harina 000' } });
    fireEvent.change(screen.getByLabelText(/Costo unitario/i), { target: { value: '820.00' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const call = fetchMock.mock.calls[0] as [string, RequestInit];
    const [url, init] = call;
    expect(url).toContain('/stock/insumos/ins-1');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body as string)).toEqual({ name: 'Harina 000', unitCost: '820.00' });
  });

  it('un campo opcional vaciado se envía como null (limpiar)', async () => {
    const withBarcode: InsumoItem = { ...insumo, barcode: '779000' };
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => withBarcode }));
    vi.stubGlobal('fetch', fetchMock);

    render(<EditInsumoModal isOpen={true} insumo={withBarcode} onClose={() => {}} onSuccess={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Código de barras/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ barcode: null });
  });

  it('sin cambios reales, cierra sin llamar a la API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const onClose = vi.fn();

    render(<EditInsumoModal isOpen={true} insumo={insumo} onClose={onClose} onSuccess={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('muestra el error del backend (409) en un banner', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 409, json: async () => ({ detail: 'Ya existe un insumo registrado con ese código de barras.' }) })));

    render(<EditInsumoModal isOpen={true} insumo={insumo} onClose={() => {}} onSuccess={() => {}} />);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Sal Fina' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});

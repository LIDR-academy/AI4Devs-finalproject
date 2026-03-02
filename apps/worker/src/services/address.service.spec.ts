import {
  buildSyncSuccessMessage,
  buildAddressProposalMessage,
  type PendingAddress,
} from './address.service';

const pending: PendingAddress = {
  gmapsFormatted: 'Calle Mayor 1, 28001 Madrid, Spain',
  gmapsPlaceId: null,
  latitude: null,
  longitude: null,
  street: 'Calle Mayor',
  number: '1',
  postalCode: '28001',
  city: 'Madrid',
  province: null,
  country: 'ES',
  block: null,
  staircase: null,
  floor: null,
  door: null,
  additionalInfo: null,
  couldBeBuilding: false,
  userConfirmedNoDetails: false,
};

describe('buildSyncSuccessMessage', () => {
  it('includes storeName in Spanish message', () => {
    const msg = buildSyncSuccessMessage(pending, 'Spanish', 'Tienda Demo');

    expect(msg).toContain('Tienda Demo');
    expect(msg).toContain('Adresles');
    expect(msg).toContain('28001');
  });

  it('includes storeName in English message', () => {
    const msg = buildSyncSuccessMessage(pending, 'English', 'Demo Store');

    expect(msg).toContain('Demo Store');
    expect(msg).toContain('Adresles');
    expect(msg).toContain('28001');
  });

  it('includes storeName in French message', () => {
    const msg = buildSyncSuccessMessage(pending, 'French', 'Boutique Demo');

    expect(msg).toContain('Boutique Demo');
    expect(msg).toContain('Adresles');
    expect(msg).toContain('28001');
  });

  it('falls back to Spanish for unknown language', () => {
    const msg = buildSyncSuccessMessage(pending, 'German', 'Tienda Demo');

    expect(msg).toContain('Tienda Demo');
    expect(msg).toContain('registrada correctamente');
  });
});

describe('buildAddressProposalMessage', () => {
  it('generates Spanish message for adresles source', () => {
    const msg = buildAddressProposalMessage(pending, 'TiendaX', 'adresles', 'Spanish');

    expect(msg).toContain('tu dirección guardada en Adresles');
    expect(msg).toContain('Responde "Sí" para confirmar');
    expect(msg).toContain('TiendaX');
    expect(msg).toContain('Calle Mayor');
    expect(msg).toContain('28001');
  });

  it('generates English message for adresles source', () => {
    const msg = buildAddressProposalMessage(pending, 'StoreY', 'adresles', 'English');

    expect(msg).toContain('your saved Adresles address');
    expect(msg).toContain('Reply "Yes" to confirm');
    expect(msg).toContain('StoreY');
  });

  it('generates Spanish message for ecommerce source', () => {
    const msg = buildAddressProposalMessage(pending, 'ModaMujer', 'ecommerce', 'Spanish');

    expect(msg).toContain('tu dirección registrada en ModaMujer');
    expect(msg).toContain('Responde "Sí" para confirmar');
  });

  it('generates English message for ecommerce source', () => {
    const msg = buildAddressProposalMessage(pending, 'FashionStore', 'ecommerce', 'English');

    expect(msg).toContain('your address registered at FashionStore');
    expect(msg).toContain('Reply "Yes" to confirm');
    expect(msg).toContain('FashionStore');
  });
});

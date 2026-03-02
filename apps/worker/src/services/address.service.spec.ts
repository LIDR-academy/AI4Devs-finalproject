import { buildSyncSuccessMessage, type PendingAddress } from './address.service';

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

import { normalizeDiscovery } from './normalization';

describe('normalizeDiscovery', () => {
  it('trims fields, removes duplicate list entries, and preserves consent', () => {
    expect(normalizeDiscovery({
      businessName: '  North  Star  ',
      category: '  Bakery ',
      services: [' Bread ', 'Bread', ' Pastries '],
      products: [' Cake ', 'Cake'],
      targetAudience: ' Local families ',
      tone: ' Warm ',
      style: ' Clear ',
      location: ' Madrid ',
      phone: ' +34 600 000 000 ',
      website: ' https://north-star.example ',
      gdprConsent: true,
    })).toEqual({
      businessName: 'North Star',
      category: 'Bakery',
      services: ['Bread', 'Pastries'],
      products: ['Cake'],
      targetAudience: 'Local families',
      tone: 'Warm',
      style: 'Clear',
      location: 'Madrid',
      phone: '+34 600 000 000',
      website: 'https://north-star.example',
      gdprConsent: true,
    });
  });
});

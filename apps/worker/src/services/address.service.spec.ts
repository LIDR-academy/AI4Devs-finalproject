import {
  buildSyncSuccessMessage,
  buildAddressProposalMessage,
  buildRegistrationOfferMessage,
  buildRegistrationEmailRequestMessage,
  buildRegistrationSuccessMessage,
  buildRegistrationDeclinedMessage,
  extractEmailFromMessage,
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

describe('buildRegistrationOfferMessage', () => {
  it('generates Spanish message', () => {
    const msg = buildRegistrationOfferMessage('Spanish');
    expect(msg).toContain('registrarte en Adresles');
    expect(msg).toContain('Sí');
    expect(msg).toContain('No');
  });

  it('generates English message', () => {
    const msg = buildRegistrationOfferMessage('English');
    expect(msg).toContain('register with Adresles');
    expect(msg).toContain('Yes');
    expect(msg).toContain('No');
  });
});

describe('buildRegistrationEmailRequestMessage', () => {
  it('generates Spanish message', () => {
    const msg = buildRegistrationEmailRequestMessage('Spanish');
    expect(msg).toContain('correo electrónico');
  });

  it('generates English message', () => {
    const msg = buildRegistrationEmailRequestMessage('English');
    expect(msg).toContain('email');
  });
});

describe('buildRegistrationSuccessMessage', () => {
  it('generates Spanish message', () => {
    const msg = buildRegistrationSuccessMessage('Spanish');
    expect(msg).toContain('registrado');
    expect(msg).toMatch(/confiar|gracias/i);
  });

  it('generates English message', () => {
    const msg = buildRegistrationSuccessMessage('English');
    expect(msg).toContain('registered');
    expect(msg).toMatch(/thank|trust/i);
  });
});

describe('buildRegistrationDeclinedMessage', () => {
  it('generates Spanish message', () => {
    const msg = buildRegistrationDeclinedMessage('Spanish');
    expect(msg).toMatch(/sin problema|hasta pronto/i);
  });

  it('generates English message', () => {
    const msg = buildRegistrationDeclinedMessage('English');
    expect(msg).toMatch(/no problem|great day/i);
  });
});

describe('extractEmailFromMessage', () => {
  it('extracts email from message with text', () => {
    expect(extractEmailFromMessage('mi correo es juan@gmail.com')).toBe('juan@gmail.com');
  });

  it('returns email when message is just the email', () => {
    expect(extractEmailFromMessage('user@domain.org')).toBe('user@domain.org');
  });

  it('returns null when no valid email', () => {
    expect(extractEmailFromMessage('no tengo correo')).toBeNull();
  });

  it('returns null for empty or whitespace', () => {
    expect(extractEmailFromMessage('')).toBeNull();
    expect(extractEmailFromMessage('   ')).toBeNull();
  });
});

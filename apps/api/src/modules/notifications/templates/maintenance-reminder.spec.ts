import { buildMaintenanceReminderEmail } from './maintenance-reminder';

describe('buildMaintenanceReminderEmail', () => {
  it('includes plate, greeting, and workshop name without costs', () => {
    const result = buildMaintenanceReminderEmail({
      ownerFullName: 'Juan Pérez',
      licensePlate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2018,
      daysSinceVisit: 200,
      workshopName: 'Taller Centro',
      workshopPhone: '2222-3333',
    });

    expect(result.subject).toContain('ABC123');
    expect(result.subject).toContain('Taller Centro');
    expect(result.text).toContain('Juan Pérez');
    expect(result.text).toContain('ABC123');
    expect(result.text).toContain('200');
    expect(result.html).toContain('Toyota');
    expect(result.html).not.toMatch(/₡|CRC|total/i);
  });

  it('escapes HTML in user-provided fields', () => {
    const result = buildMaintenanceReminderEmail({
      ownerFullName: '<script>x</script>',
      licensePlate: 'X<1>',
      brand: 'A&B',
      model: 'M"od',
      year: 2020,
      daysSinceVisit: 180,
      workshopName: 'Shop',
    });

    expect(result.html).toContain('&lt;script&gt;');
    expect(result.html).not.toContain('<script>');
  });
});

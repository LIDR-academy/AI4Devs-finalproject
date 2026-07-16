import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appRoute = (name: string) =>
  resolve(__dirname, `../../../../../apps/app-study-buddy/src/app/(app)/${name}`);

describe('@s16 app shell entry points', () => {
  it('keeps Upload and Settings out of the Home body', () => {
    const home = readFileSync(appRoute('index.tsx'), 'utf8');

    expect(home).not.toMatch(/\bLink\b/);
    expect(home).not.toMatch(/['"]\/(?:upload|settings)['"]/);
  });

  it('keeps SignOut out of Settings and header-right configuration', () => {
    const settings = readFileSync(appRoute('settings.tsx'), 'utf8');
    const layout = readFileSync(appRoute('_layout.tsx'), 'utf8');

    expect(settings).not.toMatch(/\bSignOut\b/);
    expect(layout).not.toMatch(/\bheaderRight\b/);
  });
});

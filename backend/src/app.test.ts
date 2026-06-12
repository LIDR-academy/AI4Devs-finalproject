import { app } from './app';

describe('US-000-TASK-02: backend app.ts exports express app', () => {
  it('exports a truthy value with a listen method (Express instance)', () => {
    expect(app).toBeTruthy();
    expect(typeof app.listen).toBe('function');
  });
});

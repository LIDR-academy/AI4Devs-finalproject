export abstract class BaseBuilder<T> {
  protected abstract defaultData: Partial<T>;
  protected currentData: Partial<T> = {};
  
  constructor() {
    this.reset();
  }
  
  protected reset(): void {
    this.currentData = { ...this.defaultData };
  }
  
  create(data: Partial<T> = {}): T {
    const result = { ...this.currentData, ...data } as T;
    this.reset();
    return result;
  }
  
  createMany(count: number, data: Partial<T> = {}): T[] {
    const result = Array.from({ length: count }, () => this.create(data));
    this.reset();
    return result;
  }
}

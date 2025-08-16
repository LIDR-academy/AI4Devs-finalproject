import { Factory } from 'rosie';

type BuilderFactory<T> = ReturnType<typeof Factory.define<T>>

export abstract class BaseBuilder<T> {
  private defaultData: Partial<T>;
  protected options: Partial<T> = {};
  
  constructor(protected readonly factory: BuilderFactory<T>) {
    this.defaultData = this.factory.build();
  }
  
  reset(): void {
    this.options = { ...this.defaultData };
  }
  
  create(): T {
    return this.factory.build(this.options);
  }
  
  createMany(count: number): T[] {
    return this.factory.buildList(count, this.options)
  }
}

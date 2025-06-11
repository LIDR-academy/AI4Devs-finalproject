import { Price } from '../valueObjects/Price';
import { ProductId } from '../valueObjects/ProductId';
import { ProductName } from '../valueObjects/ProductName';

export class Product {
  private readonly _id: ProductId;
  private _name: ProductName;
  private _description: string;
  private _price: Price;
  private _category: string;
  private _tags: string[];
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: ProductId,
    name: ProductName,
    description: string,
    price: Price,
    category: string,
    tags: string[] = [],
    isActive: boolean = true,
    createdAt: Date,
    updatedAt: Date
  ) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._price = price;
    this._category = category;
    this._tags = tags;
    this._isActive = isActive;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  // Getters
  get id(): ProductId {
    return this._id;
  }

  get name(): ProductName {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get price(): Price {
    return this._price;
  }

  get category(): string {
    return this._category;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  updateName(name: ProductName): void {
    this._name = name;
    this._updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  updatePrice(price: Price): void {
    this._price = price;
    this._updatedAt = new Date();
  }

  updateCategory(category: string): void {
    this._category = category;
    this._updatedAt = new Date();
  }

  updateTags(tags: string[]): void {
    this._tags = [...tags];
    this._updatedAt = new Date();
  }

  updateIsActive(isActive: boolean): void {
    this._isActive = isActive;
    this._updatedAt = new Date();
  }

  addTag(tag: string): void {
    if (!this._tags.includes(tag)) {
      this._tags.push(tag);
      this._updatedAt = new Date();
    }
  }

  removeTag(tag: string): void {
    const index = this._tags.indexOf(tag);
    if (index > -1) {
      this._tags.splice(index, 1);
      this._updatedAt = new Date();
    }
  }

  // Serialization method for DTO conversion
  toDTO() {
    return {
      id: this._id.getValue(),
      name: this._name.getValue(),
      description: this._description,
      price: this._price.getValue(),
      category: this._category,
      tags: [...this._tags],
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
  
  // Factory method for creating from DTO
  static fromDTO(dto: any): Product {
    return new Product(
      new ProductId(dto.id),
      new ProductName(dto.name),
      dto.description,
      new Price(dto.price),
      dto.category,
      dto.tags || [],
      dto.isActive !== undefined ? dto.isActive : true,
      dto.createdAt instanceof Date ? dto.createdAt : new Date(dto.createdAt),
      dto.updatedAt instanceof Date ? dto.updatedAt : new Date(dto.updatedAt)
    );
  }
} 
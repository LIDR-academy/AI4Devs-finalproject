import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryService } from '../../../../backend/src/application/services/category.service';
import { Category, CategoryFlow } from '../../../../backend/src/domain/entities/category.entity';
import { CreateCategoryDto } from '../../../../backend/src/application/dto/create-category.dto';
import { UpdateCategoryDto } from '../../../../backend/src/application/dto/update-category.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Transaction } from '../../../../backend/src/domain/entities/transaction.entity';

describe('CategoryService Integration Tests', () => {
  let service: CategoryService;
  let categoryRepository: Repository<Category>;
  let transactionRepository: Repository<Transaction>;

  const mockCategoryRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockTransactionRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category successfully', async () => {
      // Arrange
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
        flow: CategoryFlow.EXPENSE,
        color: '#FF5733',
        description: 'Test category description',
      };

      const expectedCategory = new Category(
        createCategoryDto.name,
        createCategoryDto.flow,
        createCategoryDto.color,
        createCategoryDto.description,
      );
      expectedCategory.id = 'test-id';

      mockCategoryRepository.save.mockResolvedValue(expectedCategory);

      // Act
      const result = await service.create(createCategoryDto);

      // Assert
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Category',
          flow: CategoryFlow.EXPENSE,
          color: '#FF5733',
          description: 'Test category description',
        })
      );
      expect(result).toEqual(expectedCategory);
    });

    it('should create a category with minimal required fields', async () => {
      // Arrange
      const createCategoryDto: CreateCategoryDto = {
        name: 'Minimal Category',
        flow: CategoryFlow.INCOME,
      };

      const expectedCategory = new Category(
        createCategoryDto.name,
        createCategoryDto.flow,
      );
      expectedCategory.id = 'minimal-id';

      mockCategoryRepository.save.mockResolvedValue(expectedCategory);

      // Act
      const result = await service.create(createCategoryDto);

      // Assert
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Minimal Category',
          flow: CategoryFlow.INCOME,
          color: undefined,
          description: undefined,
        })
      );
      expect(result).toEqual(expectedCategory);
    });
  });

  describe('findAll', () => {
    it('should return all categories ordered by name', async () => {
      // Arrange
      const mockCategories = [
        { id: '1', name: 'Category A', flow: CategoryFlow.EXPENSE },
        { id: '2', name: 'Category B', flow: CategoryFlow.INCOME },
      ];

      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should return empty array when no categories exist', async () => {
      // Arrange
      mockCategoryRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a category when found', async () => {
      // Arrange
      const categoryId = 'test-id';
      const mockCategory = { id: categoryId, name: 'Test Category' };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);

      // Act
      const result = await service.findOne(categoryId);

      // Assert
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      mockCategoryRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(categoryId)).rejects.toThrow('Category with ID non-existent-id not found');
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      // Arrange
      const categoryId = 'test-id';
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category',
        color: '#00FF00',
        description: 'Updated description',
      };

      const existingCategory = new Category('Old Name', CategoryFlow.EXPENSE);
      existingCategory.id = categoryId;
      existingCategory.color = '#FF0000';
      existingCategory.description = 'Old description';

      const updatedCategory = { ...existingCategory, ...updateCategoryDto };

      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      // Act
      const result = await service.update(categoryId, updateCategoryDto);

      // Assert
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Category',
          color: '#00FF00',
          description: 'Updated description',
        })
      );
      expect(result).toEqual(updatedCategory);
    });

    it('should update only provided fields', async () => {
      // Arrange
      const categoryId = 'test-id';
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Name Only',
      };

      const existingCategory = new Category('Old Name', CategoryFlow.EXPENSE);
      existingCategory.id = categoryId;
      existingCategory.color = '#FF0000';
      existingCategory.description = 'Old description';

      const updatedCategory = { ...existingCategory, name: 'Updated Name Only' };

      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      // Act
      const result = await service.update(categoryId, updateCategoryDto);

      // Assert
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name Only',
          color: '#FF0000', // Should remain unchanged
          description: 'Old description', // Should remain unchanged
        })
      );
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException when updating non-existent category', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Name' };

      mockCategoryRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(categoryId, updateCategoryDto)).rejects.toThrow('Category with ID non-existent-id not found');
    });
  });

  describe('remove', () => {
    it('should delete a category successfully when not in use', async () => {
      // Arrange
      const categoryId = 'test-id';
      const mockCategory = { id: categoryId, name: 'Test Category' };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockTransactionRepository.count.mockResolvedValue(0);
      mockCategoryRepository.remove.mockResolvedValue(mockCategory);

      // Act
      await service.remove(categoryId);

      // Assert
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(mockTransactionRepository.count).toHaveBeenCalledWith({
        where: { categoryId },
      });
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw BadRequestException when category is in use', async () => {
      // Arrange
      const categoryId = 'test-id';
      const mockCategory = { id: categoryId, name: 'Test Category' };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockTransactionRepository.count.mockResolvedValue(3);

      // Act & Assert
      await expect(service.remove(categoryId)).rejects.toThrow(
        'Cannot delete category "Test Category" because it is being used by 3 transaction(s). Please reassign or delete those transactions first.'
      );
      expect(mockTransactionRepository.count).toHaveBeenCalledWith({
        where: { categoryId },
      });
      expect(mockCategoryRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting non-existent category', async () => {
      // Arrange
      const categoryId = 'non-existent-id';
      mockCategoryRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(categoryId)).rejects.toThrow('Category with ID non-existent-id not found');
      expect(mockTransactionRepository.count).not.toHaveBeenCalled();
      expect(mockCategoryRepository.remove).not.toHaveBeenCalled();
    });
  });
});

import { test, expect } from '@playwright/test';
import { categoriesApi, CreateCategoryDto, UpdateCategoryDto, CategoryResponseDtoFlowEnum } from '@/services/api';

// Mock fetch for contract testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Category CRUD Operations Contract Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Create Category', () => {
    describe('Given valid category data', () => {
      describe('When creating a new category', () => {
        it('Then it should return the created category', async () => {
          // Arrange: Mock successful HTTP response
          const createData: CreateCategoryDto = {
            name: 'Test Category',
            flow: CategoryResponseDtoFlowEnum.Expense,
            color: '#FF5733',
            description: 'Test category description'
          };

          const mockCreatedCategory = {
            id: 'new-category-id',
            name: 'Test Category',
            flow: CategoryResponseDtoFlowEnum.Expense,
            color: '#FF5733',
            description: 'Test category description',
            parentId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 201,
            statusText: 'Created',
            json: async () => mockCreatedCategory
          });

          // Act: Call the API
          const result = await categoriesApi.categoryControllerCreate({ createCategoryDto: createData });

          // Assert: Verify the contract
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/categories'),
            expect.objectContaining({
              method: 'POST',
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: expect.stringContaining('"name":"Test Category"')
            })
          );
          expect(result).toEqual(mockCreatedCategory);
          expect(result.id).toBe('new-category-id');
          expect(result.name).toBe('Test Category');
        });
      });
    });

    describe('Given invalid category data', () => {
      describe('When creating a category with missing required fields', () => {
        it('Then it should throw a validation error', async () => {
          // Arrange: Mock HTTP validation error response
          const invalidData = {
            name: '', // Missing required field
            color: '#FF5733'
          } as CreateCategoryDto;

          mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            json: async () => ({ message: 'Validation failed: name is required' })
          });

          // Act & Assert: Verify error handling
          await expect(categoriesApi.categoryControllerCreate({ createCategoryDto: invalidData })).rejects.toThrow();
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/categories'),
            expect.objectContaining({
              method: 'POST',
              body: expect.stringContaining('"name":""')
            })
          );
        });
      });
    });
  });

  describe('Fetch Categories', () => {
    describe('Given a successful API response', () => {
      describe('When fetching all categories', () => {
        it('Then it should return a list of categories', async () => {
          // Arrange: Mock successful HTTP response
          const mockCategories = [
            {
              id: 'cat-1',
              name: 'Groceries',
              flow: CategoryResponseDtoFlowEnum.Expense,
              color: '#EF4444',
              description: 'Food and household items',
              parentId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'cat-2',
              name: 'Salary',
              flow: CategoryResponseDtoFlowEnum.Income,
              color: '#10B981',
              description: 'Regular employment income',
              parentId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];

          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => mockCategories
          });

          // Act: Call the API
          const result = await categoriesApi.categoryControllerFindAll();

          // Assert: Verify the contract
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/categories'),
            expect.objectContaining({
              method: 'GET',
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              })
            })
          );
          expect(result).toEqual(mockCategories);
          expect(result).toHaveLength(2);
          expect(result[0].name).toBe('Groceries');
          expect(result[1].name).toBe('Salary');
        });
      });
    });

    describe('Given an API error response', () => {
      describe('When fetching categories fails', () => {
        it('Then it should throw an error with proper message', async () => {
          // Arrange: Mock HTTP error response
          mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: async () => ({ message: 'Failed to fetch categories' })
          });

          // Act & Assert: Verify error handling
          await expect(categoriesApi.categoryControllerFindAll()).rejects.toThrow();
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/categories'),
            expect.any(Object)
          );
        });
      });
    });
  });

  describe('Update Category', () => {
    describe('Given valid update data', () => {
      describe('When updating an existing category', () => {
        it('Then it should return the updated category', async () => {
          // Arrange: Mock successful HTTP response
          const updateData: UpdateCategoryDto = {
            name: 'Updated Category',
            color: '#00FF00',
            description: 'Updated description'
          };

          const mockUpdatedCategory = {
            id: 'cat-1',
            name: 'Updated Category',
            flow: CategoryResponseDtoFlowEnum.Expense,
            color: '#00FF00',
            description: 'Updated description',
            parentId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => mockUpdatedCategory
          });

          // Act: Call the API
          const result = await categoriesApi.categoryControllerUpdate({
            id: 'cat-1',
            updateCategoryDto: updateData
          });

          // Assert: Verify the contract
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/categories/cat-1'),
            expect.objectContaining({
              method: 'PATCH',
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              }),
              body: expect.stringContaining('"name":"Updated Category"')
            })
          );
          expect(result).toEqual(mockUpdatedCategory);
          expect(result.name).toBe('Updated Category');
          expect(result.color).toBe('#00FF00');
        });
      });
    });

    describe('Given invalid update data', () => {
      describe('When updating a category with invalid data', () => {
        it('Then it should throw a validation error', async () => {
          // Arrange: Mock HTTP validation error response
          const invalidData = {
            name: '', // Invalid empty name
            color: '#FF5733'
          } as UpdateCategoryDto;

          mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            json: async () => ({ message: 'Validation failed: name cannot be empty' })
          });

          // Act & Assert: Verify error handling
          await expect(categoriesApi.categoryControllerUpdate({
            id: 'cat-1',
            updateCategoryDto: invalidData
          })).rejects.toThrow();
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/categories/cat-1'),
            expect.objectContaining({
              method: 'PATCH',
              body: expect.stringContaining('"name":""')
            })
          );
        });
      });
    });
  });

  describe('Delete Category', () => {
    describe('Given a valid category ID', () => {
      describe('When deleting an unused category', () => {
        it('Then it should delete the category successfully', async () => {
          // Arrange: Mock successful HTTP response
          mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => ({ message: 'Category deleted successfully' })
          });

          // Act: Call the API
          await categoriesApi.categoryControllerRemove({ id: 'cat-1' });

          // Assert: Verify the contract
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/categories/cat-1'),
            expect.objectContaining({
              method: 'DELETE',
              headers: expect.objectContaining({
                'Content-Type': 'application/json'
              })
            })
          );
        });
      });
    });

    describe('Given a category in use', () => {
      describe('When trying to delete a category with transactions', () => {
        it('Then it should throw an error with proper message', async () => {
          // Arrange: Mock HTTP error response
          mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            json: async () => ({ 
              message: 'Cannot delete category "Groceries" because it is being used by 3 transaction(s). Please reassign or delete those transactions first.' 
            })
          });

          // Act & Assert: Verify error handling
          await expect(categoriesApi.categoryControllerRemove({ id: 'cat-1' })).rejects.toThrow();
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/categories/cat-1'),
            expect.objectContaining({
              method: 'DELETE'
            })
          );
        });
      });
    });

    describe('Given a non-existent category ID', () => {
      describe('When trying to delete a non-existent category', () => {
        it('Then it should throw a not found error', async () => {
          // Arrange: Mock HTTP not found response
          mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            json: async () => ({ message: 'Category not found' })
          });

          // Act & Assert: Verify error handling
          await expect(categoriesApi.categoryControllerRemove({ id: 'non-existent-id' })).rejects.toThrow();
          expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/categories/non-existent-id'),
            expect.objectContaining({
              method: 'DELETE'
            })
          );
        });
      });
    });
  });
});

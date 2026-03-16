import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

export const ApiStandardResponse = <TModel extends Type<any>>(
  model: TModel,
  status: number = 200,
  description?: string,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      description: description || 'Operación exitosa',
      schema: {
        type: 'object',
        properties: {
          data: {
            $ref: getSchemaPath(model),
          },
          statusCode: {
            type: 'number',
            example: status,
          },
          timestamp: {
            type: 'string',
            example: new Date().toISOString(),
          },
        },
      },
    }),
  );
};

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: 200,
      description: 'Lista paginada',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          statusCode: {
            type: 'number',
            example: 200,
          },
          timestamp: {
            type: 'string',
            example: new Date().toISOString(),
          },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              total: { type: 'number', example: 100 },
              totalPages: { type: 'number', example: 10 },
            },
          },
        },
      },
    }),
  );
};

const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskApp REST API',
      version: '1.0.0',
      description: 'Scalable REST API with JWT Auth, RBAC, MongoDB, and Swagger docs',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Internal server error' },
            data: { nullable: true, example: null },
            errors: { nullable: true, example: [] },
          },
        },
        ApiResponseBase: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { nullable: true },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
        UserSchema: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665c9f2a9a0e3c2d0c9b1a2b' },
            name: { type: 'string', example: 'Paridhi' },
            email: { type: 'string', example: 'paridhi@test.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            isActive: { type: 'boolean', example: true },
          },
        },
        TaskSchema: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665c9f2a9a0e3c2d0c9b1a2c' },
            title: { type: 'string', example: 'Fix login bug' },
            description: { type: 'string', example: 'Investigate token refresh failure' },
            status: { type: 'string', enum: ['pending', 'in_progress', 'done'], example: 'pending' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
            owner: { $ref: '#/components/schemas/UserSchema' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
        AuthPayloadSchema: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/UserSchema' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        AuthResponseSchema: {
          type: 'object',
          allOf: [
            { $ref: '#/components/schemas/ApiResponseBase' },
            {
              type: 'object',
              properties: {
                data: { $ref: '#/components/schemas/AuthPayloadSchema' },
              },
            },
          ],
        },
      },
    },
    security: [],
  },
  apis: [path.join(__dirname, '../../src/routes/**/*.js')],
});

module.exports = { swaggerSpec };

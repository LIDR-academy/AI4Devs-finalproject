"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    const configService = app.get(config_1.ConfigService);
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('BarberSync Pro API')
        .setDescription('API para sistema de gestión de citas para barberías')
        .setVersion('1.0')
        .addTag('auth', 'Endpoints de autenticación')
        .addTag('users', 'Gestión de usuarios')
        .addTag('barbershops', 'Gestión de barberías')
        .addTag('appointments', 'Gestión de citas')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = configService.get('app.port');
    await app.listen(port);
    logger.log(`🚀 BarberSync API running on: http://localhost:${port}/api/v1`);
    logger.log(`📊 Environment: ${configService.get('app.nodeEnv')}`);
    logger.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`🌐 CORS enabled for: http://localhost:3000, http://localhost:3001`);
}
bootstrap();
//# sourceMappingURL=main.js.map
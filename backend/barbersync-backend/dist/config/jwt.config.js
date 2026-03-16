"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET || 'default-secret-key',
    signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
}));
//# sourceMappingURL=jwt.config.js.map
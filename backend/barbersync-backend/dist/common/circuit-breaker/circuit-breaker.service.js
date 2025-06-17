"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CircuitBreakerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = exports.OperationType = void 0;
const common_1 = require("@nestjs/common");
var OperationType;
(function (OperationType) {
    OperationType["DATABASE"] = "DATABASE";
    OperationType["EXTERNAL_API"] = "EXTERNAL_API";
    OperationType["INTERNAL_SERVICE"] = "INTERNAL_SERVICE";
    OperationType["CRITICAL"] = "CRITICAL";
})(OperationType || (exports.OperationType = OperationType = {}));
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (CircuitState = {}));
class SimpleCircuitBreaker {
    config;
    state = CircuitState.CLOSED;
    failureCount = 0;
    lastFailureTime = 0;
    successCount = 0;
    constructor(config) {
        this.config = config;
    }
    async execute(fn) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
                this.state = CircuitState.HALF_OPEN;
                this.successCount = 0;
            }
            else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
        try {
            const result = await Promise.race([
                fn(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), this.config.timeoutMs))
            ]);
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= 2) {
                this.state = CircuitState.CLOSED;
            }
        }
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.config.failureThreshold) {
            this.state = CircuitState.OPEN;
        }
    }
    getState() {
        return this.state;
    }
    getStats() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            lastFailureTime: this.lastFailureTime
        };
    }
}
let CircuitBreakerService = CircuitBreakerService_1 = class CircuitBreakerService {
    logger = new common_1.Logger(CircuitBreakerService_1.name);
    breakers = new Map();
    stats = new Map();
    constructor() {
        this.initializeBreakers();
    }
    configs = {
        [OperationType.DATABASE]: {
            failureThreshold: 5,
            resetTimeout: 30000,
            maxRetryAttempts: 3,
            timeoutMs: 10000,
        },
        [OperationType.EXTERNAL_API]: {
            failureThreshold: 3,
            resetTimeout: 60000,
            maxRetryAttempts: 2,
            timeoutMs: 15000,
        },
        [OperationType.INTERNAL_SERVICE]: {
            failureThreshold: 7,
            resetTimeout: 20000,
            maxRetryAttempts: 2,
            timeoutMs: 8000,
        },
        [OperationType.CRITICAL]: {
            failureThreshold: 3,
            resetTimeout: 45000,
            maxRetryAttempts: 4,
            timeoutMs: 5000,
        }
    };
    initializeBreakers() {
        Object.values(OperationType).forEach((type) => {
            const config = this.configs[type];
            this.breakers.set(type, new SimpleCircuitBreaker(config));
            this.stats.set(type, {
                name: type,
                state: 'CLOSED',
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                lastFailure: null,
                lastStateChange: new Date(),
                consecutiveFailures: 0
            });
        });
    }
    async execute(operationType, operation, fallback, context) {
        const breaker = this.breakers.get(operationType);
        if (!breaker) {
            throw new Error(`Circuit Breaker for ${operationType} not found`);
        }
        const operationContext = context || 'unknown operation';
        try {
            this.incrementStats(operationType, 'total');
            this.logger.debug(`Executing ${operationContext} with ${operationType} policy`);
            let lastError;
            const config = this.configs[operationType];
            for (let attempt = 1; attempt <= config.maxRetryAttempts; attempt++) {
                try {
                    const result = await breaker.execute(operation);
                    this.incrementStats(operationType, 'success');
                    this.updateStats(operationType, breaker.getState());
                    return result;
                }
                catch (error) {
                    lastError = error;
                    if (attempt < config.maxRetryAttempts) {
                        await this.delay(Math.pow(2, attempt) * 100);
                    }
                }
            }
            throw lastError;
        }
        catch (error) {
            this.incrementStats(operationType, 'failure');
            this.recordFailure(operationType, error);
            this.updateStats(operationType, breaker.getState());
            if (fallback && (error.message === 'Circuit breaker is OPEN' || error.message === 'Timeout')) {
                this.logger.warn(`⚡ Executing fallback for ${operationContext} [${operationType}]`);
                return await fallback();
            }
            this.logger.error(`❌ Operation failed: ${operationContext} [${operationType}]`, error.stack);
            throw error;
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async executeDatabase(operation, fallback, context = 'database operation') {
        return this.execute(OperationType.DATABASE, operation, fallback, context);
    }
    async executeExternalApi(operation, fallback, context = 'external API call') {
        return this.execute(OperationType.EXTERNAL_API, operation, fallback, context);
    }
    async executeInternalService(operation, fallback, context = 'internal service call') {
        return this.execute(OperationType.INTERNAL_SERVICE, operation, fallback, context);
    }
    async executeCritical(operation, fallback, context = 'critical operation') {
        return this.execute(OperationType.CRITICAL, operation, fallback, context);
    }
    updateStats(type, state) {
        const stats = this.stats.get(type);
        if (stats) {
            stats.state = state;
            stats.lastStateChange = new Date();
            this.stats.set(type, stats);
        }
    }
    incrementStats(type, operation) {
        const stats = this.stats.get(type);
        if (stats) {
            switch (operation) {
                case 'total':
                    stats.totalRequests++;
                    break;
                case 'success':
                    stats.successfulRequests++;
                    stats.consecutiveFailures = 0;
                    break;
                case 'failure':
                    stats.failedRequests++;
                    stats.consecutiveFailures++;
                    break;
            }
            this.stats.set(type, stats);
        }
    }
    recordFailure(type, error) {
        const stats = this.stats.get(type);
        if (stats) {
            stats.lastFailure = {
                timestamp: new Date(),
                error: error.message || 'Unknown error',
                type: error.constructor.name
            };
            this.stats.set(type, stats);
        }
    }
    getStats() {
        return Array.from(this.stats.values());
    }
    getStatsFor(type) {
        return this.stats.get(type);
    }
    getHealthStatus() {
        const allStats = this.getStats();
        const openCircuits = allStats.filter(s => s.state === 'OPEN').length;
        const totalCircuits = allStats.length;
        return {
            status: openCircuits === 0 ? 'HEALTHY' : openCircuits === totalCircuits ? 'CRITICAL' : 'DEGRADED',
            openCircuits,
            totalCircuits,
            timestamp: new Date(),
            details: allStats.map(stat => ({
                name: stat.name,
                state: stat.state,
                successRate: stat.totalRequests > 0 ? (stat.successfulRequests / stat.totalRequests) * 100 : 0,
                consecutiveFailures: stat.consecutiveFailures,
                lastFailure: stat.lastFailure?.timestamp || null
            }))
        };
    }
    reset(type) {
        const breaker = this.breakers.get(type);
        if (breaker) {
            breaker.state = CircuitState.CLOSED;
            breaker.failureCount = 0;
            return true;
        }
        return false;
    }
    resetAll() {
        Object.values(OperationType).forEach(type => {
            this.reset(type);
        });
        this.logger.log('🔄 All Circuit Breakers reset');
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = CircuitBreakerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map
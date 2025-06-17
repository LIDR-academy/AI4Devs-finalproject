export declare enum OperationType {
    DATABASE = "DATABASE",
    EXTERNAL_API = "EXTERNAL_API",
    INTERNAL_SERVICE = "INTERNAL_SERVICE",
    CRITICAL = "CRITICAL"
}
export declare class CircuitBreakerService {
    private readonly logger;
    private breakers;
    private stats;
    constructor();
    private readonly configs;
    private initializeBreakers;
    execute<T>(operationType: OperationType, operation: () => Promise<T>, fallback?: () => Promise<T>, context?: string): Promise<T>;
    private delay;
    executeDatabase<T>(operation: () => Promise<T>, fallback?: () => Promise<T>, context?: string): Promise<T>;
    executeExternalApi<T>(operation: () => Promise<T>, fallback?: () => Promise<T>, context?: string): Promise<T>;
    executeInternalService<T>(operation: () => Promise<T>, fallback?: () => Promise<T>, context?: string): Promise<T>;
    executeCritical<T>(operation: () => Promise<T>, fallback?: () => Promise<T>, context?: string): Promise<T>;
    private updateStats;
    private incrementStats;
    private recordFailure;
    getStats(): CircuitBreakerStats[];
    getStatsFor(type: OperationType): CircuitBreakerStats | undefined;
    getHealthStatus(): CircuitBreakerHealthStatus;
    reset(type: OperationType): boolean;
    resetAll(): void;
}
export interface CircuitBreakerStats {
    name: string;
    state: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastFailure: {
        timestamp: Date;
        error: string;
        type: string;
    } | null;
    lastStateChange: Date;
    consecutiveFailures: number;
}
export interface CircuitBreakerHealthStatus {
    status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    openCircuits: number;
    totalCircuits: number;
    timestamp: Date;
    details: Array<{
        name: string;
        state: string;
        successRate: number;
        consecutiveFailures: number;
        lastFailure: Date | null;
    }>;
}

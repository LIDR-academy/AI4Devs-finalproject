import { AppService } from './app.service';
import { CircuitBreakerService } from './common/circuit-breaker/circuit-breaker.service';
export declare class AppController {
    private readonly appService;
    private readonly circuitBreakerService;
    constructor(appService: AppService, circuitBreakerService: CircuitBreakerService);
    getHello(): string;
    getHealth(): {
        status: string;
        timestamp: string;
        uptime: number;
    };
    getCircuitBreakerHealth(): import("./common/circuit-breaker/circuit-breaker.service").CircuitBreakerHealthStatus;
    getCircuitBreakerStats(): {
        stats: import("./common/circuit-breaker/circuit-breaker.service").CircuitBreakerStats[];
        timestamp: string;
    };
}

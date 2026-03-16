import { Controller, Get, Post, Body, Param, Delete, Put, Inject, UseGuards, ParseIntPipe } from '@nestjs/common';
import { EmpreEnum } from './enum/enum';
import { EmpreDto } from './dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { MetricsService } from 'src/common/monitoring/metrics/metrics.service';
import { AuthGuard } from 'src/module/ms-auth/guards/auth.guard';
import { Throttle } from '@nestjs/throttler';
import { envs } from 'src/common';
import { CircuitBreaker } from 'src/common/monitoring/resilience/circuit-breaker.interceptor';

import { firstValueFrom } from 'rxjs';

@Controller(EmpreEnum.table)
export class EmpreController {

    constructor(
        @Inject(EmpreEnum.msService) private readonly service: ClientProxy,
        private readonly metrics: MetricsService
    ) { }

    @Get('/')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: EmpreEnum.smFindAll, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })

    public async findAll() {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: EmpreEnum.smFindAll }, {}));
            this.metrics.recordBusinessEvent(EmpreEnum.smFindAll, 'success');
            this.metrics.recordDependencyLatency('database', 'findAll', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(EmpreEnum.smFindAll, 'error');
            this.metrics.recordDependencyLatency('database', 'findAll', Date.now() - startTime);
            throw new RpcException(error);
        }
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: EmpreEnum.smFindById, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async findById(@Param('id', ParseIntPipe) id: number) {
        try {
            return await firstValueFrom(this.service.send({ sm: EmpreEnum.smFindById }, { id }));
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Post()
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: EmpreEnum.smCreate, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async create(@Body() data: EmpreDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: EmpreEnum.smCreate }, data));
            this.metrics.recordBusinessEvent(EmpreEnum.smCreate, 'success');
            this.metrics.recordDependencyLatency('database', 'create', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(EmpreEnum.smCreate, 'error');
            this.metrics.recordDependencyLatency('database', 'create', Date.now() - startTime);
            throw new RpcException(error);
        }
    }
    @Put(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: EmpreEnum.smUpdate, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async update(@Param('id', ParseIntPipe) id: number, @Body() data: EmpreDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: EmpreEnum.smUpdate }, { id, data }));
            this.metrics.recordBusinessEvent(EmpreEnum.smUpdate, 'success');
            this.metrics.recordDependencyLatency('database', 'update', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(EmpreEnum.smUpdate, 'error');
            this.metrics.recordDependencyLatency('database', 'update', Date.now() - startTime);
            throw new RpcException(error);
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: EmpreEnum.smDelete, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async delete(@Param('id', ParseIntPipe) id: number) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: EmpreEnum.smDelete }, { id }));
            this.metrics.recordBusinessEvent(EmpreEnum.smDelete, 'success');
            this.metrics.recordDependencyLatency('database', 'delete', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(EmpreEnum.smDelete, 'error');
            this.metrics.recordDependencyLatency('database', 'delete', Date.now() - startTime);
            throw new RpcException(error);
        }
    }
}

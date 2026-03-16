import { Controller, Get, Post, Body, Param, Delete, Put, Inject, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { OficiEnum } from './enum/enum';
import { OficiDto } from './dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { MetricsService } from 'src/common/monitoring/metrics/metrics.service';
import { AuthGuard } from 'src/module/ms-auth/guards/auth.guard';
import { Throttle } from '@nestjs/throttler';
import { envs } from 'src/common';
import { CircuitBreaker } from 'src/common/monitoring/resilience/circuit-breaker.interceptor';

import { firstValueFrom } from 'rxjs';
import { OficiParamsDto } from './dto/params';

@Controller(OficiEnum.table)
export class OficiController {

    constructor(
        @Inject(OficiEnum.msService) private readonly service: ClientProxy,
        private readonly metrics: MetricsService
    ) { }

    @Get('/')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: OficiEnum.smFindAll, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })

    @Get('/')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: OficiEnum.smFindAll, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async findAll(@Query() params: OficiParamsDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: OficiEnum.smFindAll }, params));
            this.metrics.recordBusinessEvent(OficiEnum.smFindAll, 'success');
            this.metrics.recordDependencyLatency('database', 'findAll', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(OficiEnum.smFindAll, 'error');
            this.metrics.recordDependencyLatency('database', 'findAll', Date.now() - startTime);
            throw new RpcException(error);
        }
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: OficiEnum.smFindById, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async findById(@Param('id', ParseIntPipe) id: number) {
        try {
            return await firstValueFrom(this.service.send({ sm: OficiEnum.smFindById }, { id }));
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Post()
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: OficiEnum.smCreate, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async create(@Body() data: OficiDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: OficiEnum.smCreate }, data));
            this.metrics.recordBusinessEvent(OficiEnum.smCreate, 'success');
            this.metrics.recordDependencyLatency('database', 'create', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(OficiEnum.smCreate, 'error');
            this.metrics.recordDependencyLatency('database', 'create', Date.now() - startTime);
            throw new RpcException(error);
        }
    }
    @Put(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: OficiEnum.smUpdate, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async update(@Param('id', ParseIntPipe) id: number, @Body() data: OficiDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: OficiEnum.smUpdate }, { id, data }));
            this.metrics.recordBusinessEvent(OficiEnum.smUpdate, 'success');
            this.metrics.recordDependencyLatency('database', 'update', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(OficiEnum.smUpdate, 'error');
            this.metrics.recordDependencyLatency('database', 'update', Date.now() - startTime);
            throw new RpcException(error);
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: OficiEnum.smDelete, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async delete(@Param('id', ParseIntPipe) id: number) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: OficiEnum.smDelete }, { id }));
            this.metrics.recordBusinessEvent(OficiEnum.smDelete, 'success');
            this.metrics.recordDependencyLatency('database', 'delete', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(OficiEnum.smDelete, 'error');
            this.metrics.recordDependencyLatency('database', 'delete', Date.now() - startTime);
            throw new RpcException(error);
        }
    }
}

import { Controller, Get, Post, Body, Param, Delete, Inject, Put, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { TidenDto } from './dto';
import { TidenEnum } from './enum/enum';
import { firstValueFrom } from 'rxjs';
import { ParamsDto } from 'src/shared/util';
import { AuthGuard } from 'src/module/ms-auth/guards/auth.guard';
import { MetricsService } from 'src/common/monitoring/metrics/metrics.service';
import { Throttle } from '@nestjs/throttler';
import { envs } from 'src/common/config/environment/env.config';
import { CircuitBreaker } from 'src/common/monitoring/resilience/circuit-breaker.interceptor';


@Controller(TidenEnum.table)
export class TidenContext {
    constructor(
        @Inject(TidenEnum.msService) private readonly service: ClientProxy,
        private readonly metrics: MetricsService
    ) { }

    @Get('/')
    //@UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: TidenEnum.smFindAll, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async findAll(@Query() params: ParamsDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: TidenEnum.smFindAll }, params));
            this.metrics.recordBusinessEvent(TidenEnum.smFindAll, 'success');
            this.metrics.recordDependencyLatency('database', 'findAll', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(TidenEnum.smFindAll, 'error');
            this.metrics.recordDependencyLatency('database', 'findAll', Date.now() - startTime);
            throw new RpcException(error);
        }
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: TidenEnum.smFindById, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async findById(@Param('id', ParseIntPipe) id: number) {
        try {
            return await firstValueFrom(this.service.send({ sm: TidenEnum.smFindById }, { id }));
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Post()
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: TidenEnum.smCreate, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async create(@Body() data: TidenDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: TidenEnum.smCreate }, data));
            this.metrics.recordBusinessEvent(TidenEnum.smCreate, 'success');
            this.metrics.recordDependencyLatency('database', 'create', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(TidenEnum.smCreate, 'error');
            this.metrics.recordDependencyLatency('database', 'create', Date.now() - startTime);
            throw new RpcException(error);
        }
    }
    @Put(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: TidenEnum.smUpdate, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async update(@Param('id', ParseIntPipe) id: number, @Body() data: TidenDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: TidenEnum.smUpdate }, { id, data }));
            this.metrics.recordBusinessEvent(TidenEnum.smUpdate, 'success');
            this.metrics.recordDependencyLatency('database', 'update', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(TidenEnum.smUpdate, 'error');
            this.metrics.recordDependencyLatency('database', 'update', Date.now() - startTime);
            throw new RpcException(error);
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: TidenEnum.smDelete, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async delete(@Param('id', ParseIntPipe) id: number) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: TidenEnum.smDelete }, { id }));
            this.metrics.recordBusinessEvent(TidenEnum.smDelete, 'success');
            this.metrics.recordDependencyLatency('database', 'delete', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(TidenEnum.smDelete, 'error');
            this.metrics.recordDependencyLatency('database', 'delete', Date.now() - startTime);
            throw new RpcException(error);
        }
    }
}



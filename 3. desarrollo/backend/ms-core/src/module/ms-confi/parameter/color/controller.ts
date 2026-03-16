import { Controller, Get, Post, Body, Param, Delete, Put, Inject, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { MetricsService } from 'src/common/monitoring/metrics/metrics.service';
import { AuthGuard } from 'src/module/ms-auth/guards/auth.guard';
import { Throttle } from '@nestjs/throttler';
import { envs } from 'src/common';
import { CircuitBreaker } from 'src/common/monitoring/resilience/circuit-breaker.interceptor';

import { firstValueFrom } from 'rxjs';
import { ParamsDto } from 'src/shared/util';
import { ColorEnum } from './enum/enum';
import { ColorDto } from './dto';


@Controller(ColorEnum.table)
export class ColorController {

    constructor(
        @Inject(ColorEnum.msService) private readonly service: ClientProxy,
        private readonly metrics: MetricsService
    ) { }

    @Get('/')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: ColorEnum.smFindAll, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })

    @Get('/')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: ColorEnum.smFindAll, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async findAll(@Query() params: ParamsDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: ColorEnum.smFindAll }, params));
            this.metrics.recordBusinessEvent(ColorEnum.smFindAll, 'success');
            this.metrics.recordDependencyLatency('database', 'findAll', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(ColorEnum.smFindAll, 'error');
            this.metrics.recordDependencyLatency('database', 'findAll', Date.now() - startTime);
            throw new RpcException(error);
        }
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: ColorEnum.smFindById, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async findById(@Param('id', ParseIntPipe) id: number) {
        try {
            return await firstValueFrom(this.service.send({ sm: ColorEnum.smFindById }, { id }));
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Post()
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: ColorEnum.smCreate, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async create(@Body() data: ColorDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: ColorEnum.smCreate }, data));
            this.metrics.recordBusinessEvent(ColorEnum.smCreate, 'success');
            this.metrics.recordDependencyLatency('database', 'create', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(ColorEnum.smCreate, 'error');
            this.metrics.recordDependencyLatency('database', 'create', Date.now() - startTime);
            throw new RpcException(error);
        }
    }
    @Put(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: ColorEnum.smUpdate, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async update(@Param('id', ParseIntPipe) id: number, @Body() data: ColorDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: ColorEnum.smUpdate }, { id, data }));
            this.metrics.recordBusinessEvent(ColorEnum.smUpdate, 'success');
            this.metrics.recordDependencyLatency('database', 'update', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(ColorEnum.smUpdate, 'error');
            this.metrics.recordDependencyLatency('database', 'update', Date.now() - startTime);
            throw new RpcException(error);
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: ColorEnum.smDelete, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async delete(@Param('id', ParseIntPipe) id: number) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: ColorEnum.smDelete }, { id }));
            this.metrics.recordBusinessEvent(ColorEnum.smDelete, 'success');
            this.metrics.recordDependencyLatency('database', 'delete', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(ColorEnum.smDelete, 'error');
            this.metrics.recordDependencyLatency('database', 'delete', Date.now() - startTime);
            throw new RpcException(error);
        }
    }
}

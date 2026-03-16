import { Controller, Get, Post, Body, Param, Delete, Put, Query, Inject, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OpcioEnum } from './enum/enum';
import { MetricsService } from 'src/common/monitoring/metrics/metrics.service';
import { Throttle } from '@nestjs/throttler';
import { CircuitBreaker } from 'src/common/monitoring/resilience/circuit-breaker.interceptor';
import { firstValueFrom } from 'rxjs';
import { envs } from 'src/common';
import { AuthGuard } from 'src/module/ms-auth/guards/auth.guard';
import { OpcioDto } from './dto';


@Controller(OpcioEnum.table)
export class OpcioController {

    constructor(
        @Inject(OpcioEnum.msService) private readonly service: ClientProxy,
        private readonly metrics: MetricsService
    ) { }

    @Get('/')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: OpcioEnum.smFindAll, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async findAll(@Query() params: ParamsDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: OpcioEnum.smFindAll }, params));
            this.metrics.recordBusinessEvent(OpcioEnum.smFindAll, 'success');
            this.metrics.recordDependencyLatency('database', 'findAll', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(OpcioEnum.smFindAll, 'error');
            this.metrics.recordDependencyLatency('database', 'findAll', Date.now() - startTime);
            throw new RpcException(error);
        }
    }


    @Get(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: OpcioEnum.smFindById, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async findById(@Param('id', ParseIntPipe) id: number) {
        try {
            return await firstValueFrom(this.service.send({ sm: OpcioEnum.smFindById }, { id }));
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Post()
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: OpcioEnum.smCreate, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async create(@Body() data: OpcioDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: OpcioEnum.smCreate }, data));
            this.metrics.recordBusinessEvent(OpcioEnum.smCreate, 'success');
            this.metrics.recordDependencyLatency('database', 'create', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(OpcioEnum.smCreate, 'error');
            this.metrics.recordDependencyLatency('database', 'create', Date.now() - startTime);
            throw new RpcException(error);
        }
    }
    @Put(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: OpcioEnum.smUpdate, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async update(@Param('id', ParseIntPipe) id: number, @Body() data: OpcioDto) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: OpcioEnum.smUpdate }, { id, data }));
            this.metrics.recordBusinessEvent(OpcioEnum.smUpdate, 'success');
            this.metrics.recordDependencyLatency('database', 'update', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(OpcioEnum.smUpdate, 'error');
            this.metrics.recordDependencyLatency('database', 'update', Date.now() - startTime);
            throw new RpcException(error);
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @Throttle({ default: { limit: envs.throttle.maxRequestsPerIp, ttl: envs.throttle.banDuration } })
    @CircuitBreaker({ name: OpcioEnum.smDelete, timeout: envs.circuitBreaker.timeout, errorThresholdPercentage: envs.circuitBreaker.errorThresholdPercentage, resetTimeout: envs.circuitBreaker.resetTimeout })
    public async delete(@Param('id', ParseIntPipe) id: number) {
        const startTime = Date.now();
        try {
            const result = await firstValueFrom(this.service.send({ sm: OpcioEnum.smDelete }, { id }));
            this.metrics.recordBusinessEvent(OpcioEnum.smDelete, 'success');
            this.metrics.recordDependencyLatency('database', 'delete', Date.now() - startTime);
            return result;
        } catch (error) {
            this.metrics.recordBusinessEvent(OpcioEnum.smDelete, 'error');
            this.metrics.recordDependencyLatency('database', 'delete', Date.now() - startTime);
            throw new RpcException(error);
        }
    }

}

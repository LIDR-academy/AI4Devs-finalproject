import { Injectable } from '@angular/core';
import { catchError, finalize, Observable, of, ReplaySubject, switchMap, } from 'rxjs';
import { OpcioUseCase } from '../../application/usecase';
import { OpcioRepository } from '../repository/repository';
import { OpcioEntity, OpcioParams } from '../../domain/entity';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';
import { OpcioPort } from '../../domain/port';

@Injectable({ providedIn: 'root' })
export class OpcioController implements OpcioPort {
    private readonly use_case: OpcioUseCase;
    private _get: ReplaySubject<OpcioEntity> = new ReplaySubject<OpcioEntity>(1);
    private _list: ReplaySubject<OpcioEntity[]> = new ReplaySubject<OpcioEntity[]>(1);


    constructor(
        private readonly repository: OpcioRepository,
    ) {
        this.use_case = new OpcioUseCase(this.repository);
    }

    set get(value: OpcioEntity) {
        this._get.next(value);
    }

    get get$(): Observable<OpcioEntity> {
        return this._get.asObservable();
    }

    set list(value: OpcioEntity[]) {
        this._list.next(value);
    }

    get list$(): Observable<OpcioEntity[]> {
        return this._list.asObservable();
    }



    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    public findAll(params: OpcioParams): Observable<ApiResponses<OpcioEntity>> {
        return this.use_case.findAll(params).pipe(
            catchError((error) => { throw error; }),
            switchMap((res: any) => {
                this._list.next(res.data);
                return of(res);
            })
        );
    }

    public findById(id: number): Observable<ApiResponse<OpcioEntity>> {
        return this.use_case.findById(id);
    }

    public create(data: OpcioEntity): Observable<ApiResponse<OpcioEntity>> {
        return this.use_case.create(data);
    }

    public update(id: number, data: OpcioEntity): Observable<ApiResponse<OpcioEntity>> {
        return this.use_case.update(id, data);
    }

    public delete(id: number): Observable<ApiResponse<OpcioEntity>> {
        return this.use_case.delete(id);
    }

}

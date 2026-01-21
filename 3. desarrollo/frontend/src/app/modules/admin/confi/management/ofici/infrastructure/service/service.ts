import { Injectable } from '@angular/core';
import { catchError, Observable, of, ReplaySubject, switchMap, } from 'rxjs';
import { OficiUseCase } from '../../application/usecase';
import { OficiEntity, OficiParams } from '../../domain/entity';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';
import { OficiPort } from '../../domain/port';
import { OficiRepository } from '../repository/repository';

@Injectable({ providedIn: 'root' })
export class OficiService implements OficiPort {
    private readonly use_case: OficiUseCase;
    private _get: ReplaySubject<OficiEntity> = new ReplaySubject<OficiEntity>(1);
    private _list: ReplaySubject<ApiResponses<OficiEntity>> = new ReplaySubject<ApiResponses<OficiEntity>>(1);
    private _params: OficiParams | null = null;


    constructor(
        private readonly repository: OficiRepository,
    ) {
        this.use_case = new OficiUseCase(this.repository);
    }

    set get(value: OficiEntity) {
        this._get.next(value);
    }

    get get$(): Observable<OficiEntity> {
        return this._get.asObservable();
    }

    set list(value: ApiResponses<OficiEntity>) {
        this._list.next(value);
    }

    get list$(): Observable<ApiResponses<OficiEntity>> {
        return this._list.asObservable();
    }


    public findAll(params: OficiParams): Observable<ApiResponses<OficiEntity>> {
        return this.use_case.findAll(params).pipe(
            catchError((error) => { throw error; }),
            switchMap((res: ApiResponses<OficiEntity>) => {
                this._list.next(res);
                return of(res);
            })
        );
    }

    public findById(id: number): Observable<ApiResponse<OficiEntity>> {
        return this.use_case.findById(id).pipe(
            catchError((error) => { throw error; }),
            switchMap((res: ApiResponse<OficiEntity>) => {
                this._get.next(res.data);
                return of(res);
            })
        );
    }

    public create(data: OficiEntity): Observable<ApiResponse<OficiEntity>> {
        return this.use_case.create(data).pipe(
            catchError((error) => { throw error; }),
            switchMap((res: ApiResponse<OficiEntity>) => {
                return this.refreshList(res);
            })
        );
    }

    public update(id: number, data: OficiEntity): Observable<ApiResponse<OficiEntity>> {
        return this.use_case.update(id, data).pipe(
            catchError((error) => { throw error; }),
            switchMap((res: ApiResponse<OficiEntity>) => {
                return this.refreshList(res);
            })
        );
    }

    public delete(id: number): Observable<ApiResponse<OficiEntity>> {
        return this.use_case.delete(id).pipe(
            catchError((error) => { throw error; }),
            switchMap((res: ApiResponse<OficiEntity>) => {
                return this.refreshList(res);
            })
        );
    }

    private refreshList<T>(res: T): Observable<T> {
        if (this._params) this.findAll(this._params).subscribe();
        return of(res);
    }

}

import { Injectable } from '@angular/core';
import { catchError, Observable, of, ReplaySubject, switchMap, } from 'rxjs';
import { ToficUseCase } from '../../application/usecase';
import { ToficEntity, ToficParams } from '../../domain/entity';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';
import { ToficPort } from '../../domain/port';
import { ToficDBRepository } from '../repository/repository';

@Injectable({ providedIn: 'root' })
export class ToficService implements ToficPort {

    private readonly use_case: ToficUseCase;
    private _get: ReplaySubject<ToficEntity> = new ReplaySubject<ToficEntity>(1);
    private _list: ReplaySubject<ApiResponses<ToficEntity>> = new ReplaySubject<ApiResponses<ToficEntity>>(1);
    private _params: ToficParams | null = null;

    constructor(private readonly repository: ToficDBRepository) {
        this.use_case = new ToficUseCase(this.repository);
    }

    set get(value: ToficEntity) {
        this._get.next(value);
    }

    get geted$(): Observable<ToficEntity> {
        return this._get.asObservable();
    }

    set list(value: ApiResponses<ToficEntity>) {
        this._list.next(value);
    }

    get listed$(): Observable<ApiResponses<ToficEntity>> {
        return this._list.asObservable();
    }

    public findAll(params: ToficParams): Observable<ApiResponses<ToficEntity>> {
        this._params = params;
        return this.use_case.findAll(params).pipe(
            catchError((error) => { throw error; }),
            switchMap((res: any) => {
                this._list.next(res);
                return of(res);
            })
        );
    }

    public findById(id: number): Observable<ApiResponse<ToficEntity>> {
        return this.use_case.findById(id);
    }


    public create(data: ToficEntity): Observable<ApiResponse<ToficEntity>> {
        return this.use_case.create(data).pipe(
            catchError((error) => { throw error; }),
            switchMap((res: any) => {
                this._get.next(res.data);
                return this.refreshList(res);
            })
        );
    }

    public update(id: number, data: ToficEntity): Observable<ApiResponse<ToficEntity>> {
        return this.use_case.update(id, data).pipe(
            catchError((error) => { throw error; }),
            switchMap((res: any) => {
                this._get.next(res.data);
                return this.refreshList(res);
            })
        );
    }

    public delete(id: number): Observable<ApiResponse<ToficEntity>> {
        return this.use_case.delete(id).pipe(
            catchError((error) => { throw error; }),
            switchMap((res: any) => {
                return this.refreshList(res);
            })
        );
    }

    private refreshList<T>(res: T): Observable<T> {
        if (this._params) this.findAll(this._params).subscribe(); // actualiza listado internamente

        return of(res);
    }
}

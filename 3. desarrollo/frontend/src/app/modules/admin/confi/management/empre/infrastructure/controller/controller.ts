import { Injectable } from '@angular/core';
import { catchError, Observable, of, ReplaySubject, switchMap, } from 'rxjs';
import { EmpreUseCase } from '../../application/usecase';
import { EmpreEntity } from '../../domain/entity';
import { ApiResponse } from 'app/shared/utils/response';
import { EmprePort } from '../../domain/port';
import { EmpreRepository } from '../repository/repository';

@Injectable({ providedIn: 'root' })
export class EmpreController implements EmprePort {
    private readonly use_case: EmpreUseCase;
    private _get: ReplaySubject<EmpreEntity> = new ReplaySubject<EmpreEntity>(1);
    private _list: ReplaySubject<EmpreEntity[]> = new ReplaySubject<EmpreEntity[]>(1);


    constructor(
        private readonly repository: EmpreRepository,
    ) {
        this.use_case = new EmpreUseCase(this.repository);
    }

    set get(value: EmpreEntity) {
        this._get.next(value);
    }

    get get$(): Observable<EmpreEntity> {
        return this._get.asObservable();
    }

    set list(value: EmpreEntity[]) {
        this._list.next(value);
    }

    get list$(): Observable<EmpreEntity[]> {
        return this._list.asObservable();
    }



    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    public findAll(): Observable<ApiResponse<EmpreEntity>> {
        return this.use_case.findAll().pipe(
            catchError((error) => { throw error; }),
            switchMap(res => {
                this._get.next(res.data);
                return of(res);
            })
        );
    }

    public findById(id: number): Observable<ApiResponse<EmpreEntity>> {
        return this.use_case.findById(id);
    }

    public create(data: EmpreEntity): Observable<ApiResponse<EmpreEntity>> {
        return this.use_case.create(data);
    }

    public update(id: number, data: EmpreEntity): Observable<ApiResponse<EmpreEntity>> {
        return this.use_case.update(id, data);
    }

    public delete(id: number): Observable<ApiResponse<EmpreEntity>> {
        return this.use_case.delete(id);
    }

}

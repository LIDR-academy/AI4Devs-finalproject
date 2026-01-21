import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { OpcioController } from '../../infrastructure/controller/controller';
import { Observable, Subject, takeUntil } from 'rxjs';
import { OpcioEntity } from '../../domain/entity';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'opcio-view',
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule],
})
/* export class OpcioViewComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<OpcioEntity>;
  columnsToDisplay = ['opcio_cod_opcio', 'opcio_des_opcio', 'opcio_est_opcio'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: OpcioEntity | null;

  private unsubscribe_all: Subject<any> = new Subject<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private readonly _controller: OpcioController,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._controller.list$
      .pipe(takeUntil(this.unsubscribe_all))
      .subscribe((res: OpcioEntity[]) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this._changeDetectorRef.markForCheck();
      });
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe_all.next('destroy');
    this.unsubscribe_all.complete();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isExpanded(element: OpcioEntity): boolean {
    return this.expandedElement === element;
  }

  toggle(element: OpcioEntity): void {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }
}
 */

export class OpcioViewComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<OpcioEntity>;
  columnsToDisplay = ['opcio_cod_opcio', 'opcio_des_opcio', 'opcio_est_opcio'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expandParent'];

  // Estado de expansión múltiple
  expanded = new Set<string>();

  private unsubscribe_all: Subject<any> = new Subject<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private readonly _controller: OpcioController,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._controller.list$
      .pipe(takeUntil(this.unsubscribe_all))
      .subscribe((res: OpcioEntity[]) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this._changeDetectorRef.markForCheck();
      });
  }

  ngAfterViewInit(): void {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe_all.next('destroy');
    this.unsubscribe_all.complete();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isExpanded(element: OpcioEntity): boolean {
    return this.expanded.has(element.opcio_cod_opcio);
  }

  toggle(element: OpcioEntity, event?: MouseEvent): void {
    event?.stopPropagation();
    const key = element.opcio_cod_opcio;
    if (this.expanded.has(key)) {
      this.expanded.delete(key);
    } else {
      this.expanded.add(key);
    }
    this._changeDetectorRef.markForCheck();
  }
}




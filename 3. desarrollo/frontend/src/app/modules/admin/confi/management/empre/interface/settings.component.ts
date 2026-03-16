import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, takeUntil } from 'rxjs';
import { EmpreViewComponent } from './view/view.component';
import { OficiViewComponent } from '../../ofici/interface/view/view.component';


@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        NgClass,
        EmpreViewComponent,
        OficiViewComponent,
 
    ],
})
export class EmpreSettingsComponent implements OnInit, OnDestroy {
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'empre';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Setup available panels
        this.panels = [
            {
                id: 'empre',
                icon: 'heroicons_outline:building-office',
                title: 'Empresa',
                description: 'Gestión de la información de la empresa',
            },
            {
                id: 'ofici',
                icon: 'heroicons_outline:building-office-2',
                title: 'Oficinas ',
                description: 'Gestión de oficinas',
            },
            {
                id: 'account',
                icon: 'heroicons_outline:user-circle',
                title: 'Account',
                description:
                    'Manage your public profile and private information',
            },
            {
                id: 'plan-billing',
                icon: 'heroicons_outline:credit-card',
                title: 'Plan & Billing',
                description:
                    'Manage your subscription plan, payment method and billing information',
            },
            {
                id: 'notifications',
                icon: 'heroicons_outline:bell',
                title: 'Notifications',
                description: "Manage when you'll be notified on which channels",
            },
            {
                id: 'team',
                icon: 'heroicons_outline:user-group',
                title: 'Team',
                description:
                    'Manage your existing team and change roles/permissions',
            },
        ];

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode and drawerOpened
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                } else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: string): void {
        this.selectedPanel = panel;

        // Close the drawer on 'over' mode
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any {
        return this.panels.find((panel) => panel.id === id);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}

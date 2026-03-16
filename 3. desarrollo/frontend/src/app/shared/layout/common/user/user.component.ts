import { BooleanInput } from '@angular/cdk/coercion';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewEncapsulation, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { AuthEntity } from 'app/modules/auth/domain/entity';
import { AuthController } from 'app/modules/auth/infrastructure/controller/controller';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'user',
    imports: [
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatDividerModule,
    ],
})
export class UserComponent implements OnInit, OnDestroy {
    /* eslint-disable @typescript-eslint/naming-convention */
    static ngAcceptInputType_showAvatar: BooleanInput;
    /* eslint-enable @typescript-eslint/naming-convention */

    @Input() showAvatar: boolean = true;
    auth_user: AuthEntity;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService,
        private _authController: AuthController
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._authController.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: AuthEntity) => {
            this.auth_user = user;
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
     * Update the user status
     *
     * @param status
     */
    updateUserStatus(status: string): void {
        // Return if user is not available
        if (!this.auth_user) {
            return;
        }

       /*  // Update the user
        this._userService
            .update({
                ...this.user,
                status,
            })
            .subscribe(); */
    }

    /**
     * Sign out
     */
    signOut(): void {
        this._router.navigate(['/auth/sign-out']);
    }
}

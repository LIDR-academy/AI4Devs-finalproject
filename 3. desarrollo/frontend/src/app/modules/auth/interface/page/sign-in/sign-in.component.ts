import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GeneralConstant } from 'app/common/config/constant';
import { AuthController } from 'app/modules/auth/infrastructure/controller/controller';
import { AlertComponentModule } from 'app/shared/components';
import { ButtonComponentsModule } from 'app/shared/components/button/button.module';


@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        RouterLink,
        AlertComponentModule,
        ButtonComponentsModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    public readonly generalConstant = GeneralConstant;
    public readonly year: number = new Date().getFullYear();

    public alert: { title: string; type: string; message: string } = { title: 'Error', type: 'success', message: '', };
    public signInForm: UntypedFormGroup;
    public showAlert: boolean = false;

    constructor(
        private readonly _activatedRoute: ActivatedRoute,
        private readonly _controller: AuthController,
        private readonly _formBuilder: UntypedFormBuilder,
        private readonly _router: Router
    ) { }

    ngOnInit(): void {
        this.signInForm = this._formBuilder.group({
            username: ['', [Validators.required],],
            password: ['', Validators.required],
            rememberMe: [''],
        });
    }

    signIn(): void {
        if (this.signInForm.invalid) return;
        this.signInForm.disable();
        this.showAlert = false;
        this._controller.signIn({ username: this.signInForm.value.username, password: this.signInForm.value.password }).subscribe((res) => {
            const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
            this._router.navigateByUrl(redirectURL);
        },
            (error: { title: string, message: string, status: number, details?: any, color: string }) => {
                this.signInForm.enable();
                this.signInNgForm.resetForm();
                this.alert = { title: error.title || 'Error', type: error.color || 'error', message: error.message || 'Ocurrió un error inesperado, intente nuevamente.' };
                this.showAlert = true;
            }
        );
    }
}

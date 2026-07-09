import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button.component';
import { InputComponent } from '../../../shared/components/input.component';
import { CardComponent } from '../../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, CardComponent],
  template: `
    <div class="flex items-center justify-center min-h-[70vh]">
      <app-card customClass="w-full max-w-md p-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-heading text-primary font-bold mb-2">Welcome to Aura</h2>
          <p class="text-text-secondary">Enter your email to sign in or create an account</p>
        </div>

        @if (emailSent()) {
          <div class="text-center">
            <div class="w-16 h-16 bg-success-bg text-success rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-medium mb-2">Check your email</h3>
            <p class="text-text-secondary mb-6">We've sent a magic link to <strong>{{ loginForm.value.email }}</strong></p>
            <app-button variant="ghost" (onClick)="emailSent.set(false)">Use a different email</app-button>
          </div>
        } @else {
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <app-input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              formControlName="email"
              [error]="loginForm.get('email')?.touched && loginForm.get('email')?.invalid ? 'Please enter a valid email' : ''"
            ></app-input>
            
            <div *ngIf="errorMsg()" class="p-3 bg-error-bg text-error rounded-md text-sm">
              {{ errorMsg() }}
            </div>

            <app-button type="submit" [disabled]="loginForm.invalid || isLoading()" customClass="w-full mt-2">
              {{ isLoading() ? 'Sending...' : 'Continue' }}
            </app-button>
          </form>
        }
      </app-card>
    </div>
  `
})
export default class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = signal(false);
  emailSent = signal(false);
  errorMsg = signal('');

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMsg.set('');

    const email = this.loginForm.value.email!;

    this.authService.requestMagicLink(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.emailSent.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set('Failed to send magic link. Please try again.');
        console.error(err);
      }
    });
  }
}

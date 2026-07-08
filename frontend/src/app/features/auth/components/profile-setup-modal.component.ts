import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { CardComponent } from '../../../shared/components/card.component';
import { ButtonComponent } from '../../../shared/components/button.component';
import { InputComponent } from '../../../shared/components/input.component';

@Component({
  selector: 'app-profile-setup-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent, InputComponent],
  template: `
    <div class="fixed inset-0 bg-bg-dark bg-opacity-50 flex items-center justify-center z-50 p-4">
      <app-card customClass="w-full max-w-md p-8">
        <h2 class="text-2xl font-heading font-bold text-primary mb-2">Complete Your Profile</h2>
        <p class="text-text-secondary mb-6">Just a few more details to get started.</p>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <app-input
            id="name"
            label="Full Name"
            placeholder="Jane Doe"
            formControlName="name"
            [error]="profileForm.get('name')?.touched && profileForm.get('name')?.invalid ? 'Name is required' : ''"
          ></app-input>

          <div class="flex items-start gap-2 mt-2">
            <input 
              type="checkbox" 
              id="terms" 
              formControlName="termsAccepted"
              class="mt-1 w-4 h-4 text-primary bg-card-bg border-border rounded focus:ring-primary"
            >
            <label for="terms" class="text-sm text-text-secondary">
              I accept the Terms of Service and Privacy Policy
            </label>
          </div>
          <span *ngIf="profileForm.get('termsAccepted')?.touched && profileForm.get('termsAccepted')?.invalid" class="text-xs text-error">
            You must accept the terms to continue
          </span>

          <div *ngIf="errorMsg()" class="p-3 bg-error-bg text-error rounded-md text-sm mt-2">
            {{ errorMsg() }}
          </div>

          <app-button type="submit" [disabled]="profileForm.invalid || isLoading()" customClass="w-full mt-4">
            {{ isLoading() ? 'Saving...' : 'Complete Setup' }}
          </app-button>
        </form>
      </app-card>
    </div>
  `
})
export class ProfileSetupModalComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  @Output() setupComplete = new EventEmitter<void>();

  profileForm = this.fb.group({
    name: ['', Validators.required],
    termsAccepted: [false, Validators.requiredTrue]
  });

  isLoading = signal(false);
  errorMsg = signal('');

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);
    this.errorMsg.set('');

    const formValue = this.profileForm.value;
    
    this.authService.setupProfile({
      name: formValue.name!,
      termsAccepted: formValue.termsAccepted!
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.setupComplete.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set('Failed to save profile. Please try again.');
        console.error(err);
      }
    });
  }
}

import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AccompliceService } from '../../services/accomplice.service';
import { AccompliceResponse } from '../../../../core/models/accomplice.model';

@Component({
  selector: 'app-accomplices-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './accomplices-panel.html',
  styleUrl: './accomplices-panel.scss',
})
export class AccomplicesPanel implements OnInit {
  @Input({ required: true }) eventSlug!: string;

  private accompliceService = inject(AccompliceService);
  private fb = inject(FormBuilder);

  accomplices = signal<AccompliceResponse[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  inviteForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    permissions: [['manage_guests'], [Validators.required]] // Default permission
  });

  availablePermissions = [
    { value: 'manage_guests', label: 'Manage Guests' },
    { value: 'view_financials', label: 'View Financials' },
    { value: 'edit_event', label: 'Edit Event Details' }
  ];

  ngOnInit(): void {
    this.loadAccomplices();
  }

  loadAccomplices(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.accompliceService.getAccomplices(this.eventSlug).subscribe({
      next: (data) => {
        this.accomplices.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load accomplices.');
        this.isLoading.set(false);
      }
    });
  }

  onInvite(): void {
    if (this.inviteForm.invalid) {
      return;
    }

    const { email, permissions } = this.inviteForm.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.accompliceService.inviteAccomplice(this.eventSlug, { email, permissions }).subscribe({
      next: (newAccomplice) => {
        this.accomplices.update(accs => [...accs, newAccomplice]);
        this.inviteForm.reset({ email: '', permissions: ['manage_guests'] });
        this.successMessage.set('Accomplice invited successfully!');
        this.isLoading.set(false);
        this.clearMessagesAfterDelay();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'Failed to invite accomplice.');
        this.isLoading.set(false);
      }
    });
  }

  onResendInvite(accompliceId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.accompliceService.resendInvite(this.eventSlug, accompliceId).subscribe({
      next: () => {
        this.successMessage.set('Magic link resent successfully!');
        this.isLoading.set(false);
        this.clearMessagesAfterDelay();
      },
      error: () => {
        this.errorMessage.set('Failed to resend magic link.');
        this.isLoading.set(false);
      }
    });
  }

  onRevokeAccess(accompliceId: string): void {
    if (!confirm('Are you sure you want to revoke access for this accomplice?')) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.accompliceService.revokeAccess(this.eventSlug, accompliceId).subscribe({
      next: () => {
        // Optimistically update UI
        this.accomplices.update(accs => accs.map(a => a.id === accompliceId ? { ...a, isRevoked: true } : a));
        this.successMessage.set('Access revoked successfully!');
        this.isLoading.set(false);
        this.clearMessagesAfterDelay();
      },
      error: () => {
        this.errorMessage.set('Failed to revoke access.');
        this.isLoading.set(false);
      }
    });
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage.set(null);
      this.errorMessage.set(null);
    }, 5000);
  }
}

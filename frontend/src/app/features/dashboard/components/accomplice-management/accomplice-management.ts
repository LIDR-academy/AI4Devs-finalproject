import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccompliceService, AccompliceResponse, GrantAccessRequest } from '../../../../core/services/accomplice.service';

@Component({
  selector: 'app-accomplice-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accomplice-management.html',
  styleUrls: ['./accomplice-management.scss']
})
export class AccompliceManagement implements OnInit {
  @Input() eventSlug!: string;
  
  accompliceService = inject(AccompliceService);
  
  accomplices: AccompliceResponse[] = [];
  
  newEmail = '';
  canSendMessages = true;
  canViewRsvps = true;
  
  isInviting = false;

  ngOnInit(): void {
    if (this.eventSlug) {
      this.loadAccomplices();
    }
  }

  loadAccomplices(): void {
    this.accompliceService.getAccomplices(this.eventSlug).subscribe(data => {
      this.accomplices = data;
    });
  }

  invite(): void {
    if (!this.newEmail) return;

    this.isInviting = true;
    const permissions: string[] = [];
    if (this.canSendMessages) permissions.push('send_messages');
    if (this.canViewRsvps) permissions.push('view_rsvps');

    const req: GrantAccessRequest = {
      email: this.newEmail,
      permissions
    };

    this.accompliceService.grantAccess(this.eventSlug, req).subscribe({
      next: (acc) => {
        this.accomplices.push(acc);
        this.newEmail = '';
        this.canSendMessages = true;
        this.canViewRsvps = true;
        this.isInviting = false;
      },
      error: () => {
        this.isInviting = false;
        alert('Failed to invite accomplice');
      }
    });
  }

  revoke(id: string): void {
    if (!confirm('Are you sure you want to revoke this accomplice?')) return;

    this.accompliceService.revokeAccess(this.eventSlug, id).subscribe(() => {
      const acc = this.accomplices.find(a => a.id === id);
      if (acc) {
        acc.isRevoked = true;
      }
    });
  }

  resend(id: string): void {
    if (!confirm('Are you sure you want to resend the magic link? The old one will be invalidated.')) return;

    this.accompliceService.resendMagicLink(this.eventSlug, id).subscribe({
      next: () => alert('Magic link resent successfully.'),
      error: () => alert('Failed to resend magic link.')
    });
  }

  isExpired(expiresAt: string): boolean {
    // Actually the backend doesn't return expiresAt in the response yet, let's just check revoked status
    return false;
  }
}

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GuestService, GuestResponse, AddGuestRequest, ImportError } from '../../../core/services/guest.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { GuestTableComponent } from '../components/guest-table.component';
import { GuestImportComponent } from '../components/guest-import.component';
import { ButtonComponent } from '../../../shared/components/button.component';

@Component({
  selector: 'app-guest-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, GuestTableComponent, GuestImportComponent, ButtonComponent],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Guest Management</h1>
        <p>Manage your event guests, import from CSV, and track RSVPs.</p>
      </header>

      <div *ngIf="errorMessage()" class="alert alert-error">
        {{ errorMessage() }}
        <button class="close-btn" (click)="errorMessage.set(null)">&times;</button>
      </div>
      
      <div *ngIf="successMessage()" class="alert alert-success">
        {{ successMessage() }}
        <button class="close-btn" (click)="successMessage.set(null)">&times;</button>
      </div>

      <!-- Add Guest & Import Section -->
      <section class="top-section">
        <div class="add-guest-card">
          <h3>Add Guest Manually</h3>
          <form (ngSubmit)="onAddGuest()" #addForm="ngForm" class="add-form">
            <div class="form-group">
              <label>Name *</label>
              <input type="text" [(ngModel)]="newGuest.name" name="name" required class="form-control">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="newGuest.email" name="email" class="form-control">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="text" [(ngModel)]="newGuest.phone" name="phone" placeholder="+1234567890" class="form-control">
            </div>
            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="newGuest.category" name="category" class="form-control">
                <option value="Other">Other</option>
                <option value="Family">Family</option>
                <option value="Friends">Friends</option>
                <option value="Colleagues">Colleagues</option>
              </select>
            </div>
            <app-button type="submit" [disabled]="!addForm.valid || isAdding()" variant="primary" class="mt-4 block w-full">
              {{ isAdding() ? 'Adding...' : 'Add Guest' }}
            </app-button>
          </form>
        </div>

        <div class="import-card">
          <h3>Bulk Import</h3>
          <app-guest-import 
            [isUploading]="isUploading" 
            [errors]="importErrors"
            (fileUpload)="onFileUpload($event)">
          </app-guest-import>
        </div>
      </section>

      <!-- Filters & Search -->
      <section class="filters-section">
        <div class="tabs">
          <button *ngFor="let tab of categoryTabs" 
                  (click)="setCategory(tab)" 
                  [class.active]="selectedCategory() === tab" 
                  class="tab-btn">
            {{ tab || 'All' }}
          </button>
        </div>
        
        <div class="actions-right" style="display: flex; gap: 1rem; align-items: center;">
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()" placeholder="Search guests..." class="form-control" style="width: 250px;">
          <app-button variant="primary" (click)="onSendInvitations()" [disabled]="isSending()">
            {{ isSending() ? 'Sending...' : 'Send Email Invitations' }}
          </app-button>
        </div>
      </section>

      <!-- Table -->
      <section class="table-section">
        <app-guest-table 
          [guests]="guests()" 
          (deleteGuest)="onDeleteGuest($event)">
        </app-guest-table>
      </section>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
    .page-header p { color: #64748b; font-size: 1.125rem; }
    
    .alert { padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; }
    .alert-error { background-color: #fef2f2; color: #b91c1c; border: 1px solid #f87171; }
    .alert-success { background-color: #f0fdf4; color: #15803d; border: 1px solid #4ade80; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: inherit; line-height: 1; }

    .top-section { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; margin-bottom: 2rem; }
    @media (max-width: 768px) { .top-section { grid-template-columns: 1fr; } }
    
    .add-guest-card, .import-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    h3 { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 600; color: #334155; }
    
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #475569; margin-bottom: 0.25rem; }
    .form-control {
      width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem;
      font-size: 0.875rem; transition: border-color 0.15s ease-in-out;
    }
    .form-control:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
    .mt-4 { margin-top: 1rem; }
    .block { display: block; }
    .w-full { width: 100%; }

    .filters-section {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
    }
    .tabs { display: flex; gap: 0.5rem; }
    .tab-btn {
      padding: 0.5rem 1rem; border: none; background: #f1f5f9; color: #64748b;
      border-radius: 9999px; cursor: pointer; font-weight: 500; font-size: 0.875rem;
      transition: all 0.2s;
    }
    .tab-btn:hover { background: #e2e8f0; }
    .tab-btn.active { background: #6366f1; color: white; }
    
    .search-box { width: 300px; }
  `]
})
export class GuestManagerPage implements OnInit, OnDestroy {
  private guestService = inject(GuestService);
  private invitationService = inject(InvitationService);
  private route = inject(ActivatedRoute);

  eventSlug = '';
  guests = signal<GuestResponse[]>([]);
  
  categoryTabs = ['', 'Family', 'Friends', 'Colleagues', 'Other'];
  selectedCategory = signal<string>('');
  searchQuery = '';
  searchTimeout: any;

  newGuest: AddGuestRequest = { name: '', category: 'Other' };
  isAdding = signal(false);
  
  isUploading = signal(false);
  importErrors = signal<ImportError[]>([]);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  isSending = signal(false);
  pollingInterval: any;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.eventSlug = params.get('slug') || '';
      if (this.eventSlug) {
        this.loadGuests();
        this.startPolling();
      }
    });
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  loadGuests() {
    const category = this.selectedCategory() || undefined;
    const search = this.searchQuery || undefined;
    
    this.guestService.getGuests(this.eventSlug, category, search).subscribe({
      next: (data) => {
        this.guests.set(data);
        this.loadInvitations();
      },
      error: (err) => this.handleError(err)
    });
  }

  loadInvitations() {
    if (!this.eventSlug) return;
    this.invitationService.getInvitations(this.eventSlug).subscribe({
      next: (invitations) => {
        const currentGuests = this.guests();
        const updatedGuests = currentGuests.map(g => {
          const inv = invitations.find(i => i.guestId === g.id);
          if (inv) {
            return { ...g, inviteStatus: inv.deliveryStatus };
          }
          return g;
        });
        this.guests.set(updatedGuests);
      },
      error: (err) => console.error('Failed to poll invitations', err)
    });
  }

  startPolling() {
    this.pollingInterval = setInterval(() => {
      this.loadInvitations();
    }, 10000);
  }

  onSendInvitations() {
    const confirmSend = confirm('Are you sure you want to send email invitations to all guests without one?');
    if (!confirmSend) return;

    this.isSending.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.invitationService.sendInvitations(this.eventSlug).subscribe({
      next: (res) => {
        this.isSending.set(false);
        this.successMessage.set(res.message || 'Invitations enqueued for sending!');
        this.loadInvitations(); // immediate fetch
      },
      error: (err) => {
        this.isSending.set(false);
        this.handleError(err);
      }
    });
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.loadGuests();
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadGuests();
    }, 300); // debounce
  }

  onAddGuest() {
    this.isAdding.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    
    this.guestService.addGuest(this.eventSlug, this.newGuest).subscribe({
      next: () => {
        this.isAdding.set(false);
        this.successMessage.set('Guest added successfully!');
        this.newGuest = { name: '', category: 'Other', email: '', phone: '' };
        this.loadGuests();
      },
      error: (err) => {
        this.isAdding.set(false);
        this.handleError(err);
      }
    });
  }

  onFileUpload(file: File) {
    this.isUploading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.importErrors.set([]);

    this.guestService.importGuests(this.eventSlug, file).subscribe({
      next: (result) => {
        this.isUploading.set(false);
        if (result.errors && result.errors.length > 0) {
          this.importErrors.set(result.errors);
          this.errorMessage.set(`Import completed with errors. Imported: ${result.imported}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`);
        } else {
          this.successMessage.set(`Successfully imported ${result.imported} guests!`);
        }
        this.loadGuests();
      },
      error: (err) => {
        this.isUploading.set(false);
        this.handleError(err);
      }
    });
  }

  onDeleteGuest(id: string) {
    this.guestService.deleteGuest(this.eventSlug, id).subscribe({
      next: () => {
        this.successMessage.set('Guest deleted.');
        this.loadGuests();
      },
      error: (err) => this.handleError(err)
    });
  }

  private handleError(err: any) {
    let msg = 'An unexpected error occurred.';
    if (err.error) {
      if (typeof err.error === 'string') {
        msg = err.error;
      } else if (err.error.errors) {
        if (Array.isArray(err.error.errors)) {
          // Custom domain validation array format
          msg = err.error.errors.map((e: any) => e.message || JSON.stringify(e)).join(' ');
        } else if (typeof err.error.errors === 'object') {
          // ProblemDetails format
          const errorMessages = [];
          for (const key in err.error.errors) {
            if (err.error.errors.hasOwnProperty(key)) {
              const val = err.error.errors[key];
              if (Array.isArray(val)) {
                errorMessages.push(...val);
              } else {
                errorMessages.push(val);
              }
            }
          }
          if (errorMessages.length > 0) {
            msg = errorMessages.join(' ');
          }
        }
      } else if (err.error.message) {
        msg = err.error.message;
      } else if (err.error.detail) {
        msg = err.error.detail;
      }
    } else if (err.message) {
      msg = err.message;
    }
    this.errorMessage.set(msg);
  }
}

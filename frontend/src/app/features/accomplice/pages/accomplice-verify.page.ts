import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AccompliceService } from '../../../core/services/accomplice.service';

@Component({
  selector: 'app-accomplice-verify-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verify-container">
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Verifying access...</p>
      </div>

      <div *ngIf="error" class="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2>Access has expired</h2>
        <p>{{ error }}</p>
        <p class="hint">Please contact the event host to request a new access link.</p>
      </div>
    </div>
  `,
  styles: [`
    .verify-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      text-align: center;
      background-color: var(--surface-light);
    }
    
    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .error-state svg {
      color: var(--error-color);
      margin-bottom: 1rem;
    }
    
    .error-state h2 {
      margin: 0;
      color: var(--text-primary);
    }
    
    .error-state p {
      margin: 0;
      color: var(--text-secondary);
    }
    
    .hint {
      margin-top: 1rem !important;
      font-size: 0.875rem;
    }
  `]
})
export default class AccompliceVerifyPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accompliceService = inject(AccompliceService);

  loading = true;
  error: string | null = null;

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.error = 'No token provided in URL.';
      this.loading = false;
      return;
    }

    this.accompliceService.verifyToken(token).subscribe({
      next: () => {
        // Once verified, the cookies are set. Now check auth status to load accomplice state.
        this.accompliceService.checkAuthStatus().subscribe({
          next: (res) => {
            if (res) {
              this.router.navigate(['/accomplice/panel']);
            } else {
              this.error = 'Failed to load session details.';
              this.loading = false;
            }
          },
          error: () => {
            this.error = 'Failed to load session details.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = err.error?.message || 'The access link is invalid or has expired.';
        this.loading = false;
      }
    });
  }
}

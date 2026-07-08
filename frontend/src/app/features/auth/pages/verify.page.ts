import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { CardComponent } from '../../../shared/components/card.component';
import { ButtonComponent } from '../../../shared/components/button.component';

@Component({
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <div class="flex items-center justify-center min-h-[70vh]">
      <app-card customClass="w-full max-w-md p-8 text-center">
        @if (status() === 'verifying') {
          <div class="animate-pulse flex flex-col items-center">
            <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 class="text-xl font-heading">Verifying your link...</h2>
          </div>
        } @else if (status() === 'error') {
          <div class="text-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 class="text-2xl font-bold mb-2">Link Expired or Invalid</h2>
            <p class="text-text-secondary">This magic link is no longer valid. Please request a new one.</p>
          </div>
          
          <app-button variant="primary" (onClick)="goToLogin()" customClass="w-full mb-2">
            Back to Login
          </app-button>
          
          <!-- This handles task 4.3 cooldown timer -->
          <app-button variant="secondary" (onClick)="resendLink()" [disabled]="cooldown() > 0" customClass="w-full">
            {{ cooldown() > 0 ? 'Resend in ' + cooldown() + 's' : 'Resend Magic Link' }}
          </app-button>
        }
      </app-card>
    </div>
  `
})
export default class VerifyPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  status = signal<'verifying' | 'error'>('verifying');
  cooldown = signal(0);
  private emailToResend = '';
  private timer: any;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];
      if (email) this.emailToResend = email;

      if (!token) {
        this.status.set('error');
        return;
      }

      this.authService.verifyToken(token).subscribe({
        next: (res) => {
          if (res.isFirstLogin) {
            this.router.navigate(['/dashboard'], { queryParams: { setup: true } });
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: () => {
          this.status.set('error');
        }
      });
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  resendLink() {
    if (!this.emailToResend || this.cooldown() > 0) return;
    
    this.cooldown.set(60);
    this.timer = setInterval(() => {
      this.cooldown.update(c => {
        if (c <= 1) {
          clearInterval(this.timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    this.authService.requestMagicLink(this.emailToResend).subscribe();
  }
}

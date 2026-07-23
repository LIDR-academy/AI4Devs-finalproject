import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AccompliceService } from '../../../core/services/accomplice.service';
import { LiveMessageService, LiveMessage, MessageTemplate } from '../../../core/services/live-message.service';
import { SwipeButtonComponent } from '../components/swipe-button.component';
import { MessageHistoryComponent } from '../components/message-history.component';
import { RsvpSummaryComponent } from '../components/rsvp-summary.component';

@Component({
  selector: 'app-accomplice-panel-page',
  standalone: true,
  imports: [CommonModule, SwipeButtonComponent, MessageHistoryComponent, RsvpSummaryComponent],
  template: `
    <div class="panel-container">
      <!-- Header -->
      <header class="event-header">
        <h1>Event Control Panel</h1>
        <p class="subtitle">Live Updates</p>
      </header>

      <!-- Main Content -->
      <main class="panel-content">
        <!-- Templates -->
        <section class="templates-section">
          <h2>Send Update</h2>
          <p class="hint">Swipe to send a live message to the event screens</p>
          
          <div *ngIf="templatesLoading" class="loading-state">
            Loading templates...
          </div>

          <div class="templates-list" *ngIf="!templatesLoading">
            <app-swipe-button 
              *ngFor="let tmpl of activeTemplates"
              [label]="tmpl.customMessage || tmpl.defaultMessage"
              [status]="getButtonStatus(tmpl.id)"
              (swipeComplete)="onSwipeComplete(tmpl)">
            </app-swipe-button>
          </div>
        </section>

        <!-- Sent Messages History -->
        <app-message-history [messages]="sentMessages"></app-message-history>

        <!-- RSVP Summary (if permitted) -->
        <app-rsvp-summary *ngIf="canViewRsvps" [eventSlug]="eventSlug"></app-rsvp-summary>
      </main>
    </div>
  `,
  styles: [`
    .panel-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--background-color, #f9fafb);
      color: var(--text-primary);
      padding-bottom: 4rem;
    }

    .event-header {
      background-color: var(--surface-light, #ffffff);
      padding: 2rem 1.5rem;
      text-align: center;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .event-header h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .subtitle {
      margin: 0.25rem 0 0;
      color: var(--primary-color);
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .panel-content {
      padding: 1.5rem;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    }

    .templates-section {
      margin-bottom: 2rem;
    }

    .templates-section h2 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .hint {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .loading-state {
      padding: 2rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .templates-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `]
})
export default class AccomplicePanelPage implements OnInit, OnDestroy {
  private accompliceService = inject(AccompliceService);
  private liveMessageService = inject(LiveMessageService);

  eventSlug = '';
  canViewRsvps = false;
  
  templates: MessageTemplate[] = [];
  activeTemplates: MessageTemplate[] = [];
  templatesLoading = true;

  sentMessages: LiveMessage[] = [];
  
  // Track button statuses by template ID
  buttonStatuses = new Map<string, 'idle' | 'sending' | 'sent'>();
  private buttonResetTimeouts = new Map<string, any>();

  private pollingSub?: Subscription;

  ngOnInit() {
    const accomplice = this.accompliceService.currentAccomplice()();
    if (!accomplice) {
      // Guard should prevent this, but just in case
      return;
    }

    this.eventSlug = accomplice.eventSlug;
    this.canViewRsvps = accomplice.permissions?.includes('view_rsvps') || false;

    this.loadTemplates();
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
    // Clear timeouts
    this.buttonResetTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  getButtonStatus(templateId: string): 'idle' | 'sending' | 'sent' {
    return this.buttonStatuses.get(templateId) || 'idle';
  }

  onSwipeComplete(template: MessageTemplate) {
    this.buttonStatuses.set(template.id, 'sending');

    const content = template.customMessage || template.defaultMessage;
    const category = template.category || 'general';

    this.liveMessageService.sendLiveMessage(this.eventSlug, content, category).subscribe({
      next: (sentMsg) => {
        this.buttonStatuses.set(template.id, 'sent');
        // Instantly add to history optimistically
        if (sentMsg) {
            this.sentMessages.unshift(sentMsg);
        }
        
        // Reset button to idle after 3 seconds
        if (this.buttonResetTimeouts.has(template.id)) {
          clearTimeout(this.buttonResetTimeouts.get(template.id));
        }
        const timeout = setTimeout(() => {
          this.buttonStatuses.set(template.id, 'idle');
        }, 3000);
        this.buttonResetTimeouts.set(template.id, timeout);
      },
      error: () => {
        this.buttonStatuses.set(template.id, 'idle');
        alert('Failed to send message. Please try again.');
      }
    });
  }

  private loadTemplates() {
    this.liveMessageService.getTemplates(this.eventSlug).subscribe({
      next: (res) => {
        this.templates = res;
        this.activeTemplates = this.templates.filter(t => t.isEnabled !== false);
        this.templatesLoading = false;
      },
      error: () => {
        this.templatesLoading = false;
      }
    });
  }

  private startPolling() {
    // Initial fetch
    this.fetchMessages();

    // Poll every 5 seconds
    this.pollingSub = interval(5000).pipe(
      switchMap(() => this.liveMessageService.getLiveMessages(this.eventSlug))
    ).subscribe({
      next: (messages) => {
        // Only keep messages sent by this accomplice, or we could show all.
        // Assuming the backend returns messages for this event. 
        // We'll just display them sorted by sentAt desc.
        this.sentMessages = messages.sort((a, b) => 
          new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        );
      },
      error: () => {
        // Silently fail polling
      }
    });
  }

  private fetchMessages() {
    this.liveMessageService.getLiveMessages(this.eventSlug).subscribe({
      next: (messages) => {
        this.sentMessages = messages.sort((a, b) => 
          new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        );
      }
    });
  }
}

import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateService } from '../../../../../core/services/template.service';
import { Template } from '../../../../../core/models/template.model';

@Component({
  selector: 'app-template-selection-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-container">
      <h2>Select a Template</h2>
      <p class="subtitle">Choose a design that matches your event's vibe. You can customize colors later.</p>

      @if (loading()) {
        <div class="loading">Loading templates...</div>
      } @else {
        <div class="templates-grid">
          @for (template of templates(); track template.id) {
            <div 
              class="template-card" 
              [class.selected]="selectedTemplateId() === template.id"
              (click)="selectTemplate(template.id)">
              <div class="template-image-container">
                <img [src]="template.previewUrl" [alt]="template.name" class="template-image">
                @if (template.isPremium) {
                  <span class="premium-badge">Premium</span>
                }
              </div>
              <div class="template-info">
                <h3>{{ template.name }}</h3>
              </div>
            </div>
          }
        </div>

        <div class="actions">
          <button 
            class="btn btn-primary" 
            [disabled]="!selectedTemplateId()" 
            (click)="onNext()">
            Continue
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .step-container { padding: 1rem 0; }
    h2 { font-size: 1.8rem; margin-bottom: 0.5rem; }
    .subtitle { color: #666; margin-bottom: 2rem; }
    
    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .template-card {
      border: 2px solid transparent;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #f8f9fa;
    }

    .template-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }

    .template-card.selected {
      border-color: #000;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
    }

    .template-image-container {
      height: 200px;
      position: relative;
      background: #ddd;
    }

    .template-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .premium-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #ffd700;
      color: #000;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .template-info {
      padding: 1rem;
      text-align: center;
    }

    .template-info h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }

    .btn-primary {
      background: #000;
      color: #fff;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class TemplateSelectionStepComponent implements OnInit {
  private readonly templateService = inject(TemplateService);
  
  @Output() next = new EventEmitter<string>();

  templates = signal<Template[]>([]);
  loading = signal(true);
  selectedTemplateId = signal<string | null>(null);

  ngOnInit() {
    this.templateService.getTemplates().subscribe({
      next: (data) => {
        this.templates.set(data);
        this.loading.set(false);
      },
      error: () => {
        // Handle error, maybe fallback to empty
        this.loading.set(false);
      }
    });
  }

  selectTemplate(id: string) {
    this.selectedTemplateId.set(id);
  }

  onNext() {
    const id = this.selectedTemplateId();
    if (id) {
      this.next.emit(id);
    }
  }
}

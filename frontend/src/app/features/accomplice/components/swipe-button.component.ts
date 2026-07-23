import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-swipe-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="swipe-container" #container 
         (touchstart)="onTouchStart($event)"
         (touchmove)="onTouchMove($event)"
         (touchend)="onTouchEnd()"
         (mousedown)="onMouseDown($event)"
         (click)="onClick()">
      
      <div class="swipe-track">
        <span class="swipe-text" [class.sending]="status === 'sending'" [class.sent]="status === 'sent'">
          <ng-container *ngIf="status === 'idle'">{{ label }}</ng-container>
          <ng-container *ngIf="status === 'sending'">Sending...</ng-container>
          <ng-container *ngIf="status === 'sent'">Sent <span class="check">✓</span></ng-container>
        </span>
      </div>

      <div class="swipe-knob" #knob
           [class.animating]="isAnimating"
           [class.success]="status === 'sent'"
           [style.transform]="'translateX(' + currentX + 'px)'">
        <svg *ngIf="status === 'idle' || status === 'sending'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        <svg *ngIf="status === 'sent'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <div class="swipe-progress" [style.width]="(currentX + knobWidth) + 'px'" [class.animating]="isAnimating"></div>
      
      <div class="hint-tooltip" [class.show]="showHint">Swipe to send</div>
    </div>
  `,
  styles: [`
    .swipe-container {
      position: relative;
      width: 100%;
      height: 56px;
      background-color: var(--surface-light);
      border-radius: 28px;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
      touch-action: pan-y; /* Prevent horizontal scrolling while swiping */
      user-select: none;
      cursor: grab;
      margin-bottom: 1rem;
    }
    
    .swipe-container:active {
      cursor: grabbing;
    }

    .swipe-track {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      pointer-events: none;
    }

    .swipe-text {
      color: var(--text-secondary);
      font-weight: 500;
      transition: color 0.3s ease;
    }
    
    .swipe-text.sending {
      color: var(--primary-color);
    }
    
    .swipe-text.sent {
      color: #10b981; /* Green success */
    }

    .swipe-knob {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    .swipe-knob.success {
      background-color: #10b981;
    }

    .swipe-knob.animating {
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .swipe-progress {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      background-color: rgba(var(--primary-rgb), 0.1);
      z-index: 2;
    }
    
    .swipe-progress.animating {
      transition: width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .hint-tooltip {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--text-primary);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
      white-space: nowrap;
    }
    
    .hint-tooltip.show {
      opacity: 1;
    }
    
    .check {
      font-weight: bold;
    }
  `]
})
export class SwipeButtonComponent {
  @Input() label: string = 'Swipe to send';
  @Input() status: 'idle' | 'sending' | 'sent' = 'idle';
  @Output() swipeComplete = new EventEmitter<void>();

  @ViewChild('container') containerRef!: ElementRef;
  @ViewChild('knob') knobRef!: ElementRef;

  currentX = 0;
  startX = 0;
  isDragging = false;
  isAnimating = false;
  showHint = false;
  knobWidth = 48; // Width of the knob + margin
  threshold = 0.8; // 80% to trigger

  private hintTimeout: any;

  // Touch Events
  onTouchStart(event: TouchEvent) {
    if (this.status !== 'idle') return;
    this.startDrag(event.touches[0].clientX);
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging || this.status !== 'idle') return;
    this.doDrag(event.touches[0].clientX);
  }

  onTouchEnd() {
    this.endDrag();
  }

  // Mouse Events (Fallback)
  onMouseDown(event: MouseEvent) {
    if (this.status !== 'idle') return;
    this.startDrag(event.clientX);
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent) {
    if (!this.isDragging || this.status !== 'idle') return;
    this.doDrag(event.clientX);
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp() {
    if (this.isDragging) {
      this.endDrag();
    }
  }

  onClick() {
    // If it's a tap/click without dragging
    if (this.status === 'idle' && this.currentX === 0) {
      this.triggerHint();
    }
  }

  private startDrag(clientX: number) {
    this.isDragging = true;
    this.isAnimating = false;
    this.startX = clientX - this.currentX;
  }

  private doDrag(clientX: number) {
    const containerWidth = this.containerRef.nativeElement.offsetWidth;
    const maxDragX = containerWidth - this.knobWidth - 8; // 8 is padding (4px left, 4px right)

    let newX = clientX - this.startX;
    
    // Constrain movement
    if (newX < 0) newX = 0;
    if (newX > maxDragX) newX = maxDragX;
    
    this.currentX = newX;
  }

  private endDrag() {
    this.isDragging = false;
    const containerWidth = this.containerRef.nativeElement.offsetWidth;
    const maxDragX = containerWidth - this.knobWidth - 8;
    const progress = this.currentX / maxDragX;

    this.isAnimating = true;

    if (progress >= this.threshold) {
      // Swipe successful
      this.currentX = maxDragX; // Snap to end
      this.triggerHaptic();
      this.swipeComplete.emit();
    } else {
      // Swipe incomplete, reset
      this.currentX = 0;
      if (progress > 0 && progress < 0.1) {
        // Just a tiny tap/move, show hint
        this.triggerHint();
      }
    }
  }

  private triggerHaptic() {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  private triggerHint() {
    this.showHint = true;
    if (this.hintTimeout) clearTimeout(this.hintTimeout);
    this.hintTimeout = setTimeout(() => {
      this.showHint = false;
    }, 2000);
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WebContentService } from '../../services/web-content.service';

@Component({
  selector: 'app-url-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './url-viewer.component.html',
  styleUrls: ['./url-viewer.component.scss']
})
export class UrlViewerComponent {
  private webContentService = inject(WebContentService);
  private sanitizer = inject(DomSanitizer);
  
  get safeUrl(): SafeResourceUrl {
    const url = this.webContentService.getCurrentUrl();
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
} 
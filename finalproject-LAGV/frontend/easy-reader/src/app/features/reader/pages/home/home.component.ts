import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReaderModeService } from '@shared/services/reader-mode.service';
import { UserBarComponent } from '@shared/components/user-bar/user-bar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, UserBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  
  private readerModeService = inject(ReaderModeService);
  private destroyRef = inject(DestroyRef);

  constructor(private router: Router) {
    this.destroyRef.onDestroy(() => {
     
    });
  }


  navigateToPdfViewer(): void {
    this.readerModeService.setMode('pdf');
    this.router.navigate(['/reader/pdf']);
  }
  
  navigateToWebViewer(): void {
    this.readerModeService.setMode('web');
    this.router.navigate(['/reader/web']);
  }
} 
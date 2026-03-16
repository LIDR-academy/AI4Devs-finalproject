import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WebContentService } from '../../services/web-content.service';
import { ReadingOptionsComponent } from '../reading-options/reading-options.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-url-reader',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    ReadingOptionsComponent
  ],
  templateUrl: './url-reader.component.html',
  styleUrls: ['./url-reader.component.scss']
})
export class UrlReaderComponent implements OnInit {
  @Output() urlValidated = new EventEmitter<string>();
  
  urlForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  showReadingOptions = false;
  validatedUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private webContentService: WebContentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.urlForm = this.fb.group({
      url: ['https://es.wikipedia.org/wiki', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
    });
    this.onInputChange();
  }


  async onInputChange(): Promise<void> {
    const url = this.urlForm.get('url')?.value;
    
    if (this.urlForm.valid && url) {
      try {
        this.validatedUrl = await this.webContentService.validateUrl(url);
       
        this.showReadingOptions = true;
        this.errorMessage = null;
      } catch (error) {
        this.showReadingOptions = false;
        this.errorMessage = 'Please enter a valid URL and try again.';
      }
    } else {
      this.showReadingOptions = false;
    }
  }

  onReadingModeSelected(mode: string): void {
    if (this.validatedUrl) {
      this.urlValidated.emit(this.validatedUrl);
    }
  }

  closeComponent(): void {
    this.router.navigate(['/reader']);
  }
} 
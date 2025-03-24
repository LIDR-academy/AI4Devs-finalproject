import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../features/auth/services/auth.service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-bar.component.html',
  styleUrls: ['./user-bar.component.scss']
})
export class UserBarComponent implements OnInit {
  user$: Observable<User | null>;
  isMenuOpen = false;
  
  constructor(private authService: AuthService, private router: Router) {
    this.user$ = this.authService.user$;
  }
  
  ngOnInit(): void {
    // Cualquier inicialización adicional
  }
  
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  logout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
  }
} 
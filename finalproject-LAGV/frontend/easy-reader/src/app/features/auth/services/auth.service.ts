import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
initializeApp(environment.firebaseConfig);
const auth = getAuth();

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private auth: Auth, private router: Router) {
    auth.onAuthStateChanged(user => {
      this.userSubject.next(user);
    });
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      this.userSubject.next(result.user);
    } catch (error) {
      alert('Error al iniciar sesión con Google:' + error);
    }
  }

  async logout(): Promise<void> {
    await auth.signOut();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

}



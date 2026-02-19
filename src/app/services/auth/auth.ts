import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router'; // ✅ Add Router

// ADD THIS INTERFACE at the top with other interfaces
export interface CompanySettings {
  id: number;
  company_name: string;
  logo?: string;
  // Add other company settings fields as needed
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  // Add other user fields as needed
}

export interface LoginResponse {
  user: User;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:8000/api'; // Change to your Laravel API URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router //Add Router
  ) {
    // Check if user is already logged in
    this.loadStoredUser(); //Load user from storage on init
  }

  /*Load stored user data on app initialization
   */
  private loadStoredUser(): void {
    const token = this.getToken();
    const storedUser = this.getStoredUser();
    
    if (token && storedUser) {
      this.currentUserSubject.next(storedUser);
      // Optionally validate token with backend
      this.getCurrentUser().subscribe({
        error: () => this.handleAuthError()
      });
    }
  }

  /**
   * Get CSRF cookie before login (required for Sanctum)
   */
  getCsrfCookie(): Observable<any> {
    return this.http.get(`${this.apiUrl.replace('/api', '')}/sanctum/csrf-cookie`, {
      withCredentials: true
    });
  }
  
  /**
   * Get company settings/configuration
   */
  getCompanySettings(): Observable<CompanySettings> {
    return this.http.get<CompanySettings>(`${this.apiUrl}/auth/company-settings`, {
      withCredentials: true
    });
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
        }
        //Store user data in localStorage
        this.setStoredUser(response.user);
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /*
   Logout current user
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/logout`, {}, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap(() => {
        this.clearAuthData();
      }),
      catchError(error => {
        // Even if API call fails, clear local data
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  /*
  Logout without API call (for client-side only)
   */
  logoutLocal(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      tap(user => {
        this.setStoredUser(user);
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        if (error.status === 401) {
          this.handleAuthError();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
  Check if user is logged in (alias for consistency)
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
  Get current user value (synchronous)
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Store token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Remove token from localStorage
   */
  private removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  /**
   * ✅ Store user data in localStorage
   */
  private setStoredUser(user: User): void {
    console.log(JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * ✅ Get stored user data from localStorage
   */
  private getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * ✅ Get user data (public method)
   */
  getUser(): User | null {
    return this.getStoredUser();
  }

  /**
   * ✅ Clear all authentication data
   */
  private clearAuthData(): void {
    this.removeToken();
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  /**
   * ✅ Handle authentication errors
   */
  private handleAuthError(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  /**
   * ✅ Get authorization headers (public method for interceptors)
   */
  getAuthHeadersPublic(): HttpHeaders {
    return this.getAuthHeaders();
  }
}
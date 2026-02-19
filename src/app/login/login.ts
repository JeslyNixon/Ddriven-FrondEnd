import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, LoginCredentials, CompanySettings } from '../services/auth/auth';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  companyName = signal('Ddrivn Studio Private Limited'); // Default value

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
  // Fetch company name when component loads
  this.authService.getCompanySettings().subscribe({
    next: (settings) => {
      this.companyName.set(settings.company_name);
    },
    error: (error) => {
      console.error('Failed to load company settings', error);
      // Keep default company name if API fails
    }
  });
}
  onSubmit(): void {
  this.errorMessage.set('');
 
  if (!this.email() || !this.password()) {
    this.errorMessage.set('Please fill in all fields');
    return;
  }
 
  if (!this.isValidEmail(this.email())) {
    this.errorMessage.set('Please enter a valid email address');
    return;
  }
 
  this.isLoading.set(true);
 
  const credentials: LoginCredentials = {
    email: this.email(),
    password: this.password()
  };
 
  // Get CSRF token first, then login
  this.authService.getCsrfCookie().subscribe({
    next: () => {
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          console.log('Login successful', response);
          // ✅ Token and user are automatically saved by the service
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Login error', error);
         
          if (error.status === 401) {
            this.errorMessage.set('Invalid email or password');
          } else if (error.status === 422) {
            this.errorMessage.set('Please check your input and try again');
          } else if (error.status === 0) {
            this.errorMessage.set('Unable to connect to server. Please try again later.');
          } else {
            this.errorMessage.set(error.error?.message || 'An error occurred. Please try again.');
          }
        }
      });
    },
    error: (error) => {
      this.isLoading.set(false);
      console.error('CSRF error', error);
      this.errorMessage.set('Unable to connect to server. Please try again later.');
    }
  });
}

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Update email value
   */
  onEmailChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.email.set(input.value);
  }

  /**
   * Update password value
   */
  onPasswordChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.password.set(input.value);
  }
}
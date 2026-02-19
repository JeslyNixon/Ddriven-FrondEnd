import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Auth } from '../../services/auth/auth';
import { SidebarService } from '../../services/sidebar/sidebar';
import { FooterComponent } from '../footer/footer';
import { ToastComponent } from '../toast/toast';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule,FooterComponent,ToastComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent {
  activeRoute = signal('dashboard');
  userName = signal('');
  userEmail = signal('');
  companyName = signal('');
  isMobileMenuOpen = signal(false);

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: 'dashboard' },
    { icon: 'projects', label: 'Projects', route: 'property-list' },
    { icon: 'team', label: 'User', route: 'user' },
    { icon: 'analytics', label: 'Roles', route: 'role' },
    
    { icon: 'settings', label: 'Settings', route: 'settings' },
  ];

  constructor(
    private router: Router,
    private authService: Auth,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Fetch company name when component loads
    this.authService.getCompanySettings().subscribe({
      next: (settings) => {
        this.companyName.set(settings.company_name);
      },
      error: (error) => {
        console.error('Failed to load company settings', error);
      }
    });

    const userStr = localStorage.getItem('user');
    const userNam = userStr ? JSON.parse(userStr).name : 'User';
    const email = userStr ? JSON.parse(userStr).email : 'email';

    this.userName.set(userNam);
    this.userEmail.set(email);

    // Auto-collapse on tablet/mobile
    this.checkScreenSize();
  }

  // Detect screen size and auto-collapse sidebar
  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    // Close mobile menu on resize
    if (window.innerWidth > 768) {
      this.isMobileMenuOpen.set(false);
    }
  }

  private checkScreenSize() {
    if (window.innerWidth <= 1024 && window.innerWidth > 768) {
      // Tablet - auto collapse
      this.sidebarService.collapseSidebar();
    } else if (window.innerWidth > 1024) {
      // Desktop - can be toggled
      // Don't auto-expand, keep user's preference
    }
  }

  toggleSidebar(): void {
    // On mobile, toggle mobile menu instead
    if (window.innerWidth <= 768) {
      this.toggleMobileMenu();
    } else {
      this.sidebarService.toggleSidebar();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  get isSidebarCollapsed() {
    return this.sidebarService.isCollapsed();
  }

  navigateTo(route: string): void {
    this.activeRoute.set(route);
    this.router.navigate([`/${route}`]);
    // Close mobile menu after navigation
    this.closeMobileMenu();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
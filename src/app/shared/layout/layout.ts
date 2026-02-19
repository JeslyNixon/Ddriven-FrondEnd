import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Auth } from '../../services/auth/auth';
import { SidebarService } from '../../services/sidebar/sidebar';
import { FooterComponent } from '../footer/footer';
import { ToastComponent } from '../toast/toast';
import { PermissionService } from '../../services/permission/permission';


interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
  permission?: string;  
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
    { icon: 'settings', label: 'Permission', route: 'permission' },
  ];

  constructor(
    private router: Router,
    private authService: Auth,
    public sidebarService: SidebarService,
    public permissionService:PermissionService
  ) {}

 
ngOnInit(): void {
  // Load permissions from stored user data
  const userStr = localStorage.getItem('user');
  const permission = localStorage.getItem('permission');
  if (userStr) {
    const user = JSON.parse(userStr);
    this.userName.set(user.name ?? 'User');
    this.userEmail.set(user.email ?? '');
    
    if (permission) {
    const permissions = JSON.parse(permission);
    const perms: string[] = permissions ?? [];
    this.permissionService.setPermissions(perms);
    }
  }

  this.buildMenu();  // ← build menu AFTER permissions are set
 
    this.authService.getCompanySettings().subscribe({
      next: (settings) => {
        this.companyName.set(settings.company_name);
      },
      error: (error) => {
        console.error('Failed to load company settings', error);
      }
    });
  this.checkScreenSize();
}
buildMenu(): void {
  const allItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard',  route: 'dashboard',       permission: 'dashboard.read' },
    { icon: 'projects',  label: 'Projects',   route: 'property-list',   permission: 'project.read' },
    { icon: 'team',      label: 'User',        route: 'user',            permission: 'user.read' },
    { icon: 'analytics', label: 'Roles',       route: 'role',            permission: 'role.read' },
    { icon: 'settings',  label: 'Permission',  route: 'permission',      permission: 'permission.read' },
  ];

  this.menuItems = allItems.filter(item =>
    !item.permission || this.permissionService.hasPermission(item.permission)
  );
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
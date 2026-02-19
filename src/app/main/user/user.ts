import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data/data';
import { ToastService } from '../../services/toast/toast';
import { PermissionService } from '../../services/permission/permission';


interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  roles: Role[];
}

interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at?: string;
  display_name?: string;
  description?: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.html',
  styleUrls: ['./user.scss']
})
export class UserComponent implements OnInit {
  
@ViewChild('nameInput') nameInput!: ElementRef;
  users: User[] = [];
  allRoles: Role[] = [];

  // Pagination - Initialize with defaults
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;

  // Search and Filter
  searchTerm: string = '';
  roleFilter: string = 'all';
  sortBy: string = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Loading states
  isLoading: boolean = false;
  isLoadingRoles: boolean = false;

  // Modals
  showUserModal: boolean = false;
  showDeleteModal: boolean = false;

  // Delete confirmation
  userToDelete: User | null = null;

  // Create/Edit User
  userForm = {
    id: null as number | null,
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_id: null as number | null
  };

  formErrors = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  };

  isEditMode: boolean = false;

  // Expand/collapse for mobile rows
  expandedRows: Set<number> = new Set();

  toggleExpand(userId: number): void {
    if (this.expandedRows.has(userId)) {
      this.expandedRows.delete(userId);
    } else {
      this.expandedRows.add(userId);
    }
  }

  isExpanded(userId: number): boolean {
    return this.expandedRows.has(userId);
  }

  constructor(private dataService: DataService,
    private toastService: ToastService,
    public permissionService: PermissionService) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.isLoading = true;

    const params = {
      page: this.currentPage,
      per_page: this.itemsPerPage,
      search: this.searchTerm,
      role: this.roleFilter !== 'all' ? this.roleFilter : '',
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.dataService.getUsers(params).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          const paginationData = response.data;

          // Ensure data is an array
          this.users = Array.isArray(paginationData.data) ? paginationData.data : [];

          // Set pagination values with defaults
          this.currentPage = paginationData.current_page || 1;
          this.totalPages = paginationData.last_page || 1;
          this.totalItems = paginationData.total || 0;
          this.itemsPerPage = paginationData.per_page || 10;
        } else {
          this.users = [];
          this.resetPagination();
        }

        this.isLoading = false;
      },
      error: (error: any) => {
        this.users = [];
        this.resetPagination();
        this.isLoading = false;
      }
    });
  }

  loadRoles(): void {
    this.isLoadingRoles = true;

    this.dataService.getRoles().subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          // Ensure roles is an array
          this.allRoles = Array.isArray(response.data) ? response.data : [];
        } else {
          this.allRoles = [];
        }
        this.isLoadingRoles = false;
      },
      error: (error: any) => {
        this.allRoles = [];
        this.isLoadingRoles = false;
      }
    });
  }

  resetPagination(): void {
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalItems = 0;
  }

  // Search and Filter
  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onRoleFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.currentPage = 1;
    this.loadUsers();
  }

  // Pagination
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    // Guard clause for invalid totalPages
    if (!this.totalPages || this.totalPages <= 0) {
      return [];
    }

    if (this.totalPages <= maxVisible) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, this.currentPage + 2);

    if (this.currentPage <= 3) {
      endPage = Math.min(maxVisible, this.totalPages);
    }
    if (this.currentPage >= this.totalPages - 2) {
      startPage = Math.max(1, this.totalPages - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  get showingText(): string {
    if (this.totalItems === 0) return 'No users';
    const from = ((this.currentPage - 1) * this.itemsPerPage) + 1;
    const to = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${from}-${to} of ${this.totalItems}`;
  }

  // Create User Modal
  openCreateUserModal(): void {
    this.isEditMode = false;
    this.resetUserForm();
    this.showUserModal = true; 
    setTimeout(() => this.nameInput?.nativeElement.focus(), 100);
  }

  // Edit User Modal
  openEditUserModal(user: User): void {
    this.isEditMode = true;
    const userRoles = Array.isArray(user.roles) ? user.roles : [];

    this.userForm = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role_id: userRoles.length > 0 ? userRoles[0].id : null
    };

    this.formErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    };

    this.showUserModal = true;
    setTimeout(() => this.nameInput?.nativeElement.focus(), 100);
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.isEditMode = false;
    this.resetUserForm();
  }

  resetUserForm(): void {
    this.userForm = {
      id: null,
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role_id: null
    };
    this.formErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    };
  }

  validateUserForm(): boolean {
    let isValid = true;
    this.formErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    };

    // Validate name
    if (!this.userForm.name || this.userForm.name.trim() === '') {
      this.formErrors.name = 'Name is required';
      isValid = false;
    } else if (this.userForm.name.trim().length < 3) {
      this.formErrors.name = 'Name must be at least 3 characters';
      isValid = false;
    }

    // Validate email
    if (!this.userForm.email || this.userForm.email.trim() === '') {
      this.formErrors.email = 'Email is required';
      isValid = false;
    } else if (!this.isValidEmail(this.userForm.email)) {
      this.formErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate role
    if (!this.userForm.role_id) {
      this.formErrors.role = 'Please select a role';
      isValid = false;
    }

    // Validate password (required only for create mode)
    if (!this.isEditMode) {
      if (!this.userForm.password || this.userForm.password.trim() === '') {
        this.formErrors.password = 'Password is required';
        isValid = false;
      } else if (this.userForm.password.length < 8) {
        this.formErrors.password = 'Password must be at least 8 characters';
        isValid = false;
      } else if (!/[A-Z]/.test(this.userForm.password)) {
        this.formErrors.password = 'Password must contain at least one uppercase letter';
        isValid = false;
      } else if (!/[^a-zA-Z0-9]/.test(this.userForm.password)) {
        this.formErrors.password = 'Password must contain at least one special character';
        isValid = false;
      }

      // Validate confirm password
      if (this.userForm.password !== this.userForm.confirmPassword) {
        this.formErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    } else {
      // In edit mode, only validate if password is provided
      if (this.userForm.password && this.userForm.password.length > 0) {
        if (this.userForm.password.length < 8) {
          this.formErrors.password = 'Password must be at least 8 characters';
          isValid = false;
        }
        else if (this.userForm.password !== this.userForm.confirmPassword) {
          this.formErrors.confirmPassword = 'Passwords do not match';
          isValid = false;
        }
        else if (!/[A-Z]/.test(this.userForm.password)) {
          this.formErrors.password = 'Password must contain at least one uppercase letter';
          isValid = false;
        } else if (!/[^a-zA-Z0-9]/.test(this.userForm.password)) {
          this.formErrors.password = 'Password must contain at least one special character';
          isValid = false;
        }
      }
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  saveUser(): void {
    if (!this.validateUserForm()) {
      return;
    }

    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    const params: any = {
      name: this.userForm.name.trim(),
      email: this.userForm.email.trim(),
      password: this.userForm.password,
      role_id: this.userForm.role_id
    };

    this.dataService.createUser(params).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.toastService.show('User created successfully!');
          this.closeUserModal();
          this.loadUsers();
        } else {
          this.toastService.show('Failed to create user', 'error');
        }
      },
      error: (error: any) => {
        if (error.error && error.error.errors) {
          const errors = error.error.errors;
          if (errors.email) {
            this.formErrors.email = errors.email[0];
          }
        } else {
          this.toastService.show('Failed to create user', 'error');
        }
      }
    });
  }

  updateUser(): void {
    if (!this.userForm.id) return;

    const params: any = {
      id: this.userForm.id,
      name: this.userForm.name.trim(),
      email: this.userForm.email.trim(),
      role_id: this.userForm.role_id
    };

    // Only include password if it's been changed
    if (this.userForm.password && this.userForm.password.trim() !== '') {
      params.password = this.userForm.password;
    }

    this.dataService.updateUser(params).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.toastService.show('User updated successfully!');
          this.closeUserModal();
          this.loadUsers();
        } else {
          this.toastService.show('Failed to update user', 'error');
        }
      },
      error: (error: any) => {
        if (error.error && error.error.errors) {
          const errors = error.error.errors;
          if (errors.email) {
            this.formErrors.email = errors.email[0];
          }
        } else {
          this.toastService.show('Failed to update user', 'error');
        }
      }
    });
  }

  // Delete User
  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDeleteUser(): void {
    if (!this.userToDelete) return;

    const params = {
      id: this.userToDelete.id
    };

    this.dataService.deleteUser(params).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.toastService.show('User deleted successfully!');
          this.closeDeleteModal();
          this.loadUsers();
        } else {
          this.toastService.show('Failed to delete user', 'error');
        }
      },
      error: (error: any) => {
        this.toastService.show('Failed to delete user', 'error');
      }
    });
  }

  // Helper methods
  getUserRolesText(user: User): string {
    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      return 'No roles';
    }
    return user.roles.map(role => role.display_name || role.guard_name || role.name).join(', ');
  }

  getRoleDisplayName(role: Role): string {
    return role.display_name || role.guard_name || role.name;
  }

  getRoleDescription(role: Role): string {
    return role.description || `${role.guard_name || role.name} role`;
  }

  formatDate(date: string | null): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  }

  getRoleBadgeClass(roleName: string): string {
    const roleClasses: { [key: string]: string } = {
      'admin': 'badge-admin',
      'manager': 'badge-manager',
      'inspector': 'badge-inspector',
      'viewer': 'badge-viewer'
    };
    return roleClasses[roleName] || 'badge-default';
  }
}
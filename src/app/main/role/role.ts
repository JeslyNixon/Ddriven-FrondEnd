import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data/data';
import { ToastService } from '../../services/toast/toast';
import { PermissionService } from '../../services/permission/permission';


interface Role {
  id: number;
  name: string;
  guard_name: string;
  display_name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role.html',
  styleUrls: ['./role.scss']
})
export class RoleComponent implements OnInit {
  
@ViewChild('nameInput') nameInput!: ElementRef;
@ViewChild('dNameInput') dNameInput!: ElementRef;
  roles: Role[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;

  // Search and Sort
  searchTerm: string = '';
  sortBy: string = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Loading
  isLoading: boolean = false;

  // Modals
  showRoleModal: boolean = false;
  showDeleteModal: boolean = false;

  // Delete confirmation
  roleToDelete: Role | null = null;

  // Create/Edit Role form
  roleForm = {
    id: null as number | null,
    name: '',
    display_name: '',
    guard_name: 'api',
    description: ''
  };

  formErrors = {
    name: '',
    display_name: '',
    guard_name: '',
    description: ''
  };

  isEditMode: boolean = false;

  // Expand/collapse for mobile rows
  expandedRows: Set<number> = new Set();

  toggleExpand(roleId: number): void {
    if (this.expandedRows.has(roleId)) {
      this.expandedRows.delete(roleId);
    } else {
      this.expandedRows.add(roleId);
    }
  }

  isExpanded(roleId: number): boolean {
    return this.expandedRows.has(roleId);
  }

  constructor(private dataService: DataService,
    private toastService: ToastService,
    public permissionService: PermissionService) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading = true;

    const params = {
      page: this.currentPage,
      per_page: this.itemsPerPage,
      search: this.searchTerm,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.dataService.getRolesPaging(params).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          const paginationData = response.data;

          if (paginationData.data) {
            // Paginated response
            this.roles = Array.isArray(paginationData.data) ? paginationData.data : [];
            this.currentPage = paginationData.current_page || 1;
            this.totalPages = paginationData.last_page || 1;
            this.totalItems = paginationData.total || 0;
            this.itemsPerPage = paginationData.per_page || 10;
          } else {
            // Flat array response
            this.roles = Array.isArray(response.data) ? response.data : [];
            this.totalItems = this.roles.length;
            this.totalPages = 1;
          }
        } else {
          this.roles = [];
          this.resetPagination();
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.roles = [];
        this.resetPagination();
        this.isLoading = false;
      }
    });
  }

  resetPagination(): void {
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalItems = 0;
  }

  // Search and Sort
  onSearch(): void {
    this.currentPage = 1;
    this.loadRoles();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadRoles();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.currentPage = 1;
    this.loadRoles();
  }

  // Pagination
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRoles();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRoles();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadRoles();
    }
  }

  get pageNumbers(): number[] {
    if (!this.totalPages || this.totalPages <= 0) return [];

    const maxVisible = 5;
    if (this.totalPages <= maxVisible) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, this.currentPage + 2);

    if (this.currentPage <= 3) endPage = Math.min(maxVisible, this.totalPages);
    if (this.currentPage >= this.totalPages - 2) startPage = Math.max(1, this.totalPages - maxVisible + 1);

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  }

  get showingText(): string {
    if (this.totalItems === 0) return 'No roles';
    const from = ((this.currentPage - 1) * this.itemsPerPage) + 1;
    const to = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${from}-${to} of ${this.totalItems}`;
  }

  // Create Role Modal
  openCreateRoleModal(): void {
    this.isEditMode = false;
    this.resetRoleForm();
    this.showRoleModal = true;
     setTimeout(() => this.nameInput?.nativeElement.focus(), 100);
  }

  // Edit Role Modal
  openEditRoleModal(role: Role): void {
    this.isEditMode = true;
    this.roleForm = {
      id: role.id,
      name: role.name,
      display_name: role.display_name || '',
      guard_name: role.guard_name || 'api',
      description: role.description || ''
    };
    this.formErrors = { name: '', display_name: '', guard_name: '', description: '' };
    this.showRoleModal = true;
     setTimeout(() => this.dNameInput?.nativeElement.focus(), 100);
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.isEditMode = false;
    this.resetRoleForm();
  }

  resetRoleForm(): void {
    this.roleForm = { id: null, name: '', display_name: '', guard_name: 'api', description: '' };
    this.formErrors = { name: '', display_name: '', guard_name: '', description: '' };
  }

  validateRoleForm(): boolean {
    let isValid = true;
    this.formErrors = { name: '', display_name: '', guard_name: '', description: '' };

    if (!this.isEditMode) {
      if (!this.roleForm.name || this.roleForm.name.trim() === '') {
        this.formErrors.name = 'Role name is required';
        isValid = false;
      } else if (!/^[a-z_]+$/.test(this.roleForm.name.trim())) {
        this.formErrors.name = 'Role name must be lowercase letters and underscores only';
        isValid = false;
      }
    }

    if (!this.roleForm.guard_name) {
      this.formErrors.guard_name = 'Guard name is required';
      isValid = false;
    }

    if (this.roleForm.description && this.roleForm.description.length > 25) {
      this.formErrors.description = 'Description must be 25 characters or less';
      isValid = false;
    }

    return isValid;
  }

  saveRole(): void {
    if (!this.validateRoleForm()) return;
    this.isEditMode ? this.updateRole() : this.createRole();
  }

  createRole(): void {
    const params: any = {
      name: this.roleForm.name.trim(),
      guard_name: this.roleForm.guard_name,
      display_name: this.roleForm.display_name?.trim() || null,
      description: this.roleForm.description?.trim() || null
    };

    this.dataService.addRole(params).subscribe({
      next: (response: any) => {
        if (response && response.success) {

          this.toastService.show('Role created successfully!');
          this.closeRoleModal();
          this.loadRoles();
        } else {
          this.toastService.show('Failed to create role', 'error');
        }
      },
      error: (error: any) => {
        if (error.error?.errors?.name) {
          this.formErrors.name = error.error.errors.name[0];
        } else {
          this.toastService.show('Failed to create role', 'error');
        }
      }
    });
  }

  updateRole(): void {
    if (!this.roleForm.id) return;

    const params: any = {
      id: this.roleForm.id,
      display_name: this.roleForm.display_name?.trim() || null,
      description: this.roleForm.description?.trim() || null
    };

    this.dataService.updateRole(params).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.toastService.show('Role updated successfully!');
          this.closeRoleModal();
          this.loadRoles();
        } else {
          this.toastService.show('Failed to update role', 'error');
        }
      },
      error: (error: any) => {
        this.toastService.show('Failed to update role', 'error');
      }
    });
  }

  // Delete Role
  openDeleteModal(role: Role): void {
    this.roleToDelete = role;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.roleToDelete = null;
  }

  confirmDeleteRole(): void {
    if (!this.roleToDelete) return;

    this.dataService.deleteRole({ id: this.roleToDelete.id }).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.toastService.show('Role deleted successfully!');
          this.closeDeleteModal();
          this.loadRoles();
        } else {
          this.toastService.show('Failed to delete role', 'error');
        }
      },
      error: (error: any) => {
        this.toastService.show('Failed to delete role', 'error');
      }
    });
  }

  // Helper methods
  formatDate(date: string | null | undefined): string {
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
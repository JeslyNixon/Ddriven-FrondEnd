// services/permission/permission.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private permissions = signal<string[]>([]);

  setPermissions(perms: string[]): void {
    this.permissions.set(perms);
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  hasAnyPermission(perms: string[]): boolean {
    return perms.some(p => this.permissions().includes(p));
  }
}
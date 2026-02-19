import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast/toast';
import { DataService } from '../../services/data/data';
import { apiList } from '../../shared/api-List';

interface Role {
  id: number;
  name: string;
  guard_name: string;
  display_name?: string;
}

interface PermissionItem {
  key: string;
  label: string;
}

interface PermissionGroup {
  group: string;
  permissions: PermissionItem[];
}

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permission.html',
  styleUrls: ['./permission.scss'],
})
export class PermissionComponent implements OnInit {

  isLoading: boolean = false;

  roles: Role[] = [];
  permissionGroups: PermissionGroup[] = [];
  permissions: { [roleId: number]: { [permission: string]: boolean } } = {};

  constructor(
    private dataService: DataService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  // ── Step 1: load roles + all permissions in parallel ──────
  loadInitialData(): void {
    this.isLoading = true;

    let rolesLoaded       = false;
    let permissionsLoaded = false;

    const checkDone = () => {
      if (rolesLoaded && permissionsLoaded) {
        this.loadAllRolePermissions();
      }
    };

    // Load roles from DB
   this.dataService.getRoles().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.roles = res.data.map((r: any) => ({
            id:           r.id,
            name:         r.name,
            guard_name:   r.guard_name,
            display_name: r.display_name || r.name,
          }));
        }
        rolesLoaded = true;
        checkDone();
      },
      error: (err) => {
        console.error('Roles load failed', err);
        this.toastService.show('Failed to load roles', 'error');
        rolesLoaded = true;
        checkDone();
      }
    });

    // Load all permissions from DB (grouped)
    this.dataService.getAllPermissions().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.permissionGroups = this.buildGroups(res.data);
        }
        permissionsLoaded = true;
        checkDone();
      },
      error: (err) => {
        console.error('Permissions load failed', err);
        this.toastService.show('Failed to load permissions', 'error');
        permissionsLoaded = true;
        checkDone();
      }
    });
  }

  // ── Step 2: after roles + permissions ready, load each role's assigned permissions ──
  loadAllRolePermissions(): void {
    if (this.roles.length === 0) {
      this.isLoading = false;
      return;
    }

    let loaded = 0;

    this.roles.forEach(role => {
      this.loadPermissions(role.id, () => {
        loaded++;
        if (loaded === this.roles.length) {
          this.isLoading = false;
        }
      });
    });
  }

  loadPermissions(roleId: number, onDone?: () => void): void {
      const params={
      'role_id':roleId
     };
    this.dataService.getPermissionsByRole(params).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.permissions[roleId] = {};
          res.data.forEach((perm: any) => {
            this.permissions[roleId][perm.name] = true;
          });
        } else {
          this.permissions[roleId] = {};
        }
        onDone?.();
      },
      error: (err) => {
        console.error('Permission load failed', err);
        this.permissions[roleId] = {};
        onDone?.();
      }
    });
  }

  // ── Build grouped structure from flat DB permissions array ─
  buildGroups(allPermissions: any[]): PermissionGroup[] {
    const groupMap = new Map<string, PermissionItem[]>();

    allPermissions.forEach((perm: any) => {
      // Use group_name column from DB if available,
      // otherwise derive from permission name prefix
      const groupName = perm.group_name || this.deriveGroupName(perm.name);
      const label     = perm.label      || this.formatLabel(perm.name);

      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, []);
      }

      groupMap.get(groupName)!.push({ key: perm.name, label });
    });

    return Array.from(groupMap.entries()).map(([group, permissions]) => ({
      group,
      permissions,
    }));
  }

  // "fees.create" → "Fees"   |   "member_application.view" → "Member Application"
  private deriveGroupName(permissionName: string): string {
    const prefix = permissionName.split('.')[0];
    return prefix.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  // "fees.create" → "Create Fees"
  private formatLabel(permissionName: string): string {
    const parts   = permissionName.split('.');
    const action  = parts[parts.length - 1];
    const subject = parts.slice(0, -1).join(' ').replace(/_/g, ' ');
    return `${action.charAt(0).toUpperCase() + action.slice(1)} ${subject}`.trim();
  }

  // ── Toggle permission ─────────────────────────────────────
  togglePermission(role: Role, permissionKey: string): void {
    const roleId = role.id;

    if (!this.permissions[roleId]) {
      this.permissions[roleId] = {};
    }

    // Optimistic toggle
    this.permissions[roleId][permissionKey] = !this.permissions[roleId][permissionKey];

    const selectedPermissions = Object.keys(this.permissions[roleId])
      .filter(p => this.permissions[roleId][p] === true);

      const params = {
      role_id: roleId,
      permission_names: selectedPermissions
    };

    this.dataService.updateRolePermissions(params ).subscribe({
      next: () => {
        const granted = this.permissions[roleId][permissionKey];
        this.toastService.show(
          `Permission ${granted ? 'granted to' : 'revoked from'} ${role.name}`,
          granted ? 'success' : 'error'
        );
      },
      error: (err) => {
        console.error('Update failed', err);
        // Revert on failure
        this.permissions[roleId][permissionKey] = !this.permissions[roleId][permissionKey];
        this.toastService.show('Failed to update permission', 'error');
      }
    });
  }

  getRoleLabel(role: Role): string {
    return role.display_name || role.name;
  }
}
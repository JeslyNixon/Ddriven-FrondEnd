import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // Shared sidebar collapse state
  private _isCollapsed = signal(false);
  
  // Public readonly signal
  isCollapsed = this._isCollapsed.asReadonly();
  
  // Computed sidebar width
  sidebarWidth = computed(() => 
    this._isCollapsed() ? 80 : 280
  );

  toggleSidebar(): void {
    this._isCollapsed.set(!this._isCollapsed());
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this._isCollapsed.set(collapsed);
  }

  collapseSidebar(): void {
    this._isCollapsed.set(true);
  }

  expandSidebar(): void {
    this._isCollapsed.set(false);
  }
}
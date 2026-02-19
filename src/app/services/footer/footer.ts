import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FooterConfig {
  currentStep?: number;
  totalSteps?: number;
  showPrevious?: boolean;
  showNext?: boolean;
  showSubmit?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  disabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FooterService {
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  public sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();

  private footerConfigSubject = new BehaviorSubject<FooterConfig>({
    showPrevious: false,
    showNext: false,
    showSubmit: false,
    disabled: false
  });
  public footerConfig$ = this.footerConfigSubject.asObservable();

  private footerVisibleSubject = new BehaviorSubject<boolean>(true);
  public footerVisible$ = this.footerVisibleSubject.asObservable();

  constructor() {}

  // Sidebar state management
  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsedSubject.next(collapsed);
  }

  getSidebarCollapsed(): boolean {
    return this.sidebarCollapsedSubject.value;
  }

  // Footer configuration management
  setFooterConfig(config: FooterConfig): void {
    this.footerConfigSubject.next({
      ...this.footerConfigSubject.value,
      ...config
    });
  }

  getFooterConfig(): FooterConfig {
    return this.footerConfigSubject.value;
  }

  // Footer visibility management
  showFooter(): void {
    this.footerVisibleSubject.next(true);
  }

  hideFooter(): void {
    this.footerVisibleSubject.next(false);
  }

  // Reset footer to default state
  resetFooter(): void {
    this.footerConfigSubject.next({
      showPrevious: false,
      showNext: false,
      showSubmit: false,
      disabled: false
    });
  }

  // Helper method for multi-step forms
  setStepperFooter(currentStep: number, totalSteps: number): void {
    this.setFooterConfig({
      currentStep,
      totalSteps,
      showPrevious: currentStep > 1,
      showNext: currentStep < totalSteps,
      showSubmit: currentStep === totalSteps,
      previousLabel: 'Previous',
      nextLabel: 'Next',
      submitLabel: 'Submit'
    });
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FooterService, FooterConfig } from '../../services/footer/footer';
import { Router, NavigationEnd } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [AsyncPipe,NgIf],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isSidebarCollapsed$!: Observable<boolean>;
  config$!: Observable<FooterConfig>;
  isVisible$!: Observable<boolean>;

  // Event emitter for parent components to listen to
  private previousClickSubject = new Subject<void>();
  public previousClick$ = this.previousClickSubject.asObservable();

  private nextClickSubject = new Subject<void>();
  public nextClick$ = this.nextClickSubject.asObservable();

  private submitClickSubject = new Subject<void>();
  public submitClick$ = this.submitClickSubject.asObservable();

  constructor(
    private footerService: FooterService,
    private router: Router
  ) {
    // Initialize observables in constructor
    this.isSidebarCollapsed$ = this.footerService.sidebarCollapsed$;
    this.config$ = this.footerService.footerConfig$;
    this.isVisible$ = this.footerService.footerVisible$;
  }

  ngOnInit(): void {
    // Listen to route changes to potentially reset footer
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          // You can customize footer behavior based on routes
          this.handleRouteChange(event.url);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPrevious(): void {
    this.previousClickSubject.next();
    // Emit event that can be caught by any component
    window.dispatchEvent(new CustomEvent('footer:previous'));
  }

  onNext(): void {
    this.nextClickSubject.next();
    window.dispatchEvent(new CustomEvent('footer:next'));
  }

  onSubmit(): void {
    this.submitClickSubject.next();
    window.dispatchEvent(new CustomEvent('footer:submit'));
  }

  private handleRouteChange(url: string): void {
    // Example: Hide footer on certain routes
    if (url.includes('/login') || url.includes('/register')) {
      this.footerService.hideFooter();
    } else {
      this.footerService.showFooter();
    }
    
    // Reset footer config on route change (optional)
    // this.footerService.resetFooter();
  }
}
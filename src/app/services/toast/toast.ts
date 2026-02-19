import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast>({
    show: false,
    message: '',
    type: 'success'
  });

  toast$ = this.toastSubject.asObservable();

  show(message: string, type: 'success' | 'error'|'warning' = 'success'): void {
    this.toastSubject.next({ show: true, message, type });
    setTimeout(() => this.hide(), 3000);
  }

  hide(): void {
    this.toastSubject.next({ show: false, message: '', type: 'success' });
  }
}
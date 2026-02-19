import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService,Toast } from '../../services/toast/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: Toast = { show: false, message: '', type: 'success' };
  private subscription!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe(
      toast => this.toast = toast
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
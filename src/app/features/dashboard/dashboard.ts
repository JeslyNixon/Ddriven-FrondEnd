import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {

  activeRoute = signal('dashboard');
  userName = signal('User'); // You can fetch this from auth service
  userEmail = signal('user@example.com'); // You can fetch this from auth service

  constructor(private router: Router
    ) {}

 
   ngOnInit(): void {
   
    const userStr = localStorage.getItem('user');
    const userNam = userStr
      ? JSON.parse(userStr).name
      : 'User'
 
    this.userName.set(userNam);  // Set null if no user

 
  }

  navigateTo(route: string): void {
    this.activeRoute.set(route);
    // this.router.navigate([`/${route}`]);
  }

  logout(): void {
    // Call auth service logout
    this.router.navigate(['/login']);
  }

  createNewProject(): void {
  this.router.navigate(['/property-inspection']);
}
}
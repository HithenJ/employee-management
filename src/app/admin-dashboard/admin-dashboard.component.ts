import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { LeaveService } from '../services/leave.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  showForm = false;
  adminName: string = '';
  unreadLeaveCount: number = 0;
  pollingSubscription!: Subscription;

  constructor(
    private afAuth: AngularFireAuth,
    private http: HttpClient,
    private leaveService: LeaveService,
    public router: Router
  ) {}

  ngOnInit(): void {
    const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}');
  
    if (!adminData || adminData.role !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }
  
    this.adminName = adminData.name || 'Admin';
    this.checkForNewLeaveRequests();
    this.startPolling();
  
    this.leaveService.leaveUpdated$.subscribe(() => {
      this.checkForNewLeaveRequests();
    });
  }
  
  getAdminName(email: string): void {
    const encodedEmail = encodeURIComponent(email);
    this.http.get<any>(`http://localhost:5000/api/employees/email/${encodedEmail}`)
      .subscribe({
        next: (res) => {
          console.log('API response:', res);
  
          // Check if 'res' and 'res.name' are valid
          const fetchedName = res && res.name ? res.name : 'Admin';
  
          this.adminName = fetchedName;
  
          // Save to localStorage
          const userData = {
            email: res.email,
            name: fetchedName,
            role: res.role || 'admin',
          };
  
          localStorage.setItem('userData', JSON.stringify(userData));
                    console.log('Saved to localStorage:', userData);
        },
        error: (err) => {
          console.error('Error fetching admin info:', err);
          this.adminName = 'Admin';
        }
      });
  }
  
  startPolling() {
    this.pollingSubscription = interval(10000).subscribe(() => {
      this.checkForNewLeaveRequests();
    });
  }

  checkForNewLeaveRequests() {
    this.leaveService.getAllLeaves().subscribe((res: any[]) => {
      this.unreadLeaveCount = res.filter(leave => leave.status === 'Pending').length;
    });
  }

  // logout() {
  //   this.afAuth.signOut().then(() => {
  //     sessionStorage.removeItem('adminData');
  //     this.router.navigate(['/login']);
  //   });
  // }
  openLogoutModal() {
    // Ensure Bootstrap is loaded globally in your project
    const logoutModal = new (window as any).bootstrap.Modal(document.getElementById('logoutModal'));
    logoutModal.show();
  }
  confirmLogout() {
    sessionStorage.removeItem('adminData'); 
    this.router.navigate(['/login']); // 
  }
  // Show and hide form for adding new employee
  showAddForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  refreshList() {
    this.showForm = false;
  }

  ngOnDestroy(): void {
    // Unsubscribe from polling on component destroy to avoid memory leaks
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}

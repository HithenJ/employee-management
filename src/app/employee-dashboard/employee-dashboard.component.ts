import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { LeaveService } from '../services/leave.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  employeeId: number | any;
  leaves: any[] = [];
  employee: any = {};
  attendanceStatus: string = '';
  pendingLeaves: number = 0;
  notifications: { message: string, date: Date }[] = [];
  showLeaveForm = false;
  leaveReason = '';
  fromDate: string = '';
  toDate: string = '';
  recentMessage: string | null = null;
  loading: boolean = true;
  today: string = '';
  constructor(
    private employeeService: EmployeeService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private leaveService: LeaveService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const now = new Date();
  this.today = now.toISOString().split('T')[0];
    
    this.afAuth.authState.subscribe((user) => {
      if (user && user.email) {
        this.employeeService.getByEmail(user.email).subscribe(data => {
          this.employee = data;
          this.loadPendingLeaves();
          this.getLeaveHistory(); // 🔥 call immediately to trigger notifications instantly
          this.watchLeaveStatus();
          this.loading = false;
  
          // Optional auto-refresh
          setInterval(() => {
            this.loadPendingLeaves();
            this.getLeaveHistory(); // keep this to refresh notifications on interval
          }, 30000);
        });
      }
    });
  }
  

  addNotification(msg: string) {
    this.notifications.unshift({
      message: msg,
      date: new Date()
    });
  }

  watchLeaveStatus() {
    setInterval(() => {
      if (this.employee?.id) {
        this.leaveService.getLeaveHistory(this.employee.id).subscribe((data: any[]) => {
          const recent = data[0];
          if (recent && recent.status !== this.recentMessage) {
            if (recent.status === 'Approved') {
              const msg = `🎉 Your leave from ${recent.fromDate} to ${recent.toDate} was Approved!`;
              this.toastr.success(msg);
              this.addNotification(msg);
            } else if (recent.status === 'Rejected') {
              const msg = `❌ Your leave from ${recent.fromDate} to ${recent.toDate} was Rejected.`;
              this.toastr.warning(msg);
              this.addNotification(msg);
            }
            this.recentMessage = recent.status;
          }
        });
      }
    }, 10000);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  openLeaveForm() {
    this.showLeaveForm = true;
  }

  closeLeaveForm() {
    this.showLeaveForm = false;
  }

  loadPendingLeaves() {
    if (this.employee?.id) {
      this.leaveService.getPendingLeaves(this.employee.id).subscribe(leaves => {
        this.pendingLeaves = leaves.length;
      });
    }
  }

  loadRecentLeaveStatus() {
    if (this.employee?.id) {
      this.leaveService.getLeaveHistory(this.employee.id).subscribe(data => {
        if (data && data.length > 0) {
          const recent = data[0];
          if (recent.status === 'Approved') {
            const msg = `🎉 Your leave from ${recent.fromDate} to ${recent.toDate} was Approved!`;
            this.recentMessage = msg;
            this.addNotification(msg);
          } else if (recent.status === 'Rejected') {
            const msg = `❌ Your leave from ${recent.fromDate} to ${recent.toDate} was Rejected.`;
            this.recentMessage = msg;
            this.addNotification(msg);
          }
        }
      });
    }
  }

  submitLeaveRequest() {
    if (this.leaveReason && this.employee?.id && this.employee?.name && this.fromDate && this.toDate) {
      const leave = {
        employeeId: this.employee.id,
        name: this.employee.name,
        reason: this.leaveReason,
        fromDate: this.fromDate,
        toDate: this.toDate
      };
      this.leaveService.applyLeave(leave).subscribe({
        next: () => {
          this.toastr.success('Leave request submitted successfully!');
          this.addNotification('Your leave request has been submitted.');
          this.leaveReason = '';
          this.fromDate = '';
          this.toDate = '';
          this.showLeaveForm = false;
          this.loadPendingLeaves();
          this.loadRecentLeaveStatus();
        },
        error: () => {
          alert('Failed to submit leave request.');
        }
      });
    } else {
      alert('Please fill all fields!');
    }
  }

  getLeaveHistory(): void {
    if (this.employee?.id) {
      this.leaveService.getLeaveHistory(this.employee.id).subscribe((data: any[]) => {
        this.leaves = data;
        const recent = this.leaves[0];
  
        if (recent) {
          if (recent.status !== this.recentMessage) {
            if (recent.status === 'Approved') {
              const msg = `🎉 Your leave from ${recent.fromDate} to ${recent.toDate} was Approved!`;
              this.toastr.success(msg);
              this.addNotification(msg);
            } else if (recent.status === 'Rejected') {
              const msg = `❌ Your leave from ${recent.fromDate} to ${recent.toDate} was Rejected.`;
              this.toastr.warning(msg);
              this.addNotification(msg);
            }
            this.recentMessage = recent.status;
          }
        }
      });
    }
  }
  
}

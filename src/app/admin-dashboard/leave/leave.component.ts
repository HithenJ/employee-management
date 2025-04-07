import { Component, OnInit } from '@angular/core';
import { LeaveService } from '../../services/leave.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css']
})
export class LeaveComponent implements OnInit {
  leaveRequests: any[] = [];
  loading: boolean = false;
  actionInProgress: number | null = null;
  notification: string | null = null;

  constructor(
    private leaveService: LeaveService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchLeaveRequests();
  }

  fetchLeaveRequests() {
    this.leaveService.getAllLeaves().subscribe(
      (res: any) => {
        this.leaveRequests = res;
      },
      (err) => {
        console.error("Error fetching leave requests", err);
      }
    );
  }

  handleLeaveAction(id: number, status: 'Approved' | 'Rejected') {
    this.actionInProgress = id;

    const leave = this.leaveRequests.find(l => l.id === id);
    const empName = leave ? leave.employeeName : 'Employee';
    const employeeId = leave ? leave.employeeId : null; // Ensure you have employeeId in your leave data
    const fromDate = leave ? leave.fromDate : '';
    const toDate = leave ? leave.toDate : '';

    if (!employeeId) {
      console.error('Employee ID missing in leave request.');
      return;
    }

    this.leaveService.updateLeaveStatus(id, status).subscribe({
      next: () => {
        // Send Notification to Employee
        this.notificationService.sendLeaveNotification(employeeId, fromDate, toDate, status.toLowerCase() as 'approved' | 'rejected')
          .then(() => console.log("Notification sent successfully"))
          .catch(err => console.error("Error sending notification", err));

        this.notification = `✅ ${empName}'s request ${status}`;
        this.fetchLeaveRequests();
        this.actionInProgress = null;

        setTimeout(() => this.notification = null, 3000);
      },
      error: (err: any) => {
        console.error(`Error updating leave status to ${status}`, err);
        this.actionInProgress = null;
      }
    });
  }
}

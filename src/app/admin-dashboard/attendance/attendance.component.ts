import { Component, OnInit } from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import { EmployeeService } from '../../services/employee.service'; // import employee service

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  attendance = { employeeId: '', date: '', status: '' };
  employees: any[] = [];
  successMessage = '';

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService // inject employee service
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getAll().subscribe((data: any) => {
      this.employees = data;
    });
  }
  markAttendance() {
    this.attendanceService.create(this.attendance).subscribe({
      next: () => {
        // After marking attendance, also update employee status
        this.attendanceService.updateEmployeeStatus(+this.attendance.employeeId, this.attendance.status).subscribe({
          next: () => {
            this.successMessage = 'Attendance marked successfully and status updated!';
            this.attendance = { employeeId: '', date: '', status: '' };
            // Auto-hide after 5 seconds
            setTimeout(() => {
              this.successMessage = '';
            }, 5000);
          },
          error: (err) => {
            console.error('Error updating employee status:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error marking attendance:', err);
      }
    });
  }
  
  
}

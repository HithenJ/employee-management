// attendance.component.ts
import { Component, OnInit } from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  attendance = {
    employeeId: '',
    date: '',
    status: ''
  };

  employees: any[] = [];
  attendanceList: any[] = [];

  successMessage = '';
  errorMessage = '';
  showModal = false;

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAttendance();
  }

  loadEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: () => this.errorMessage = 'Failed to load employees'
    });
  }

  loadAttendance(): void {
    this.attendanceService.getAll().subscribe({
      next: (data) => {
        this.attendanceList = data;
      },
      error: () => this.errorMessage = 'Failed to load attendance'
    });
  }

  markAttendance(): void {
    this.attendanceService.create(this.attendance).subscribe({
      next: () => {
        this.successMessage = 'Attendance marked successfully!';
        this.attendance = { employeeId: '', date: '', status: '' };
        this.loadAttendance();
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: () => {
        this.errorMessage = 'Failed to mark attendance';
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }
  
}

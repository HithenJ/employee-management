// attendance.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-attendance',
  template: `
    <h2>Attendance</h2>
    <ul *ngIf="attendanceRecords.length > 0">
      <li *ngFor="let record of attendanceRecords">
        Date: {{ record.date }} - Status: {{ record.status }}
      </li>
    </ul>
  `
})
export class AttendanceComponent implements OnInit {
  attendanceRecords: any[] = [];
  employeeId: string = '';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.employeeId = this.route.snapshot.params['id'];
    this.http.get(`/api/attendance/${this.employeeId}`).subscribe((data: any) => {
      this.attendanceRecords = data;
    });
  }
}

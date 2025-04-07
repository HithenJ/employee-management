import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:5000/api/attendance';

  constructor(private http: HttpClient) {}

  create(attendance: any) {
    return this.http.post('http://localhost:8080/api/attendance', attendance);
  }
  
  updateEmployeeStatus(employeeId: number, status: string) {
    return this.http.patch(`http://localhost:8080/api/employees/${employeeId}`, { attendanceStatus: status });
  }
  
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}

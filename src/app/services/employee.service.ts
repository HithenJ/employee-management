import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employeeApiUrl = 'http://localhost:5000/api/employees';
  private attendanceApiUrl = 'http://localhost:5000/api/attendance';
  private baseUrl = 'http://localhost:5000/employees';
  constructor(private http: HttpClient) {}

  //  Get all employees
  getAll(): Observable<any> {
    return this.http.get(this.employeeApiUrl);
  }

  //  Get employee by ID
  getById(id: number): Observable<any> {
    return this.http.get(`${this.employeeApiUrl}/${id}`);
  }

  //  Create employee
  create(employee: any): Observable<any> {
    console.log("Sending to backend:", employee);
    return this.http.post(this.employeeApiUrl, employee);
  }

  //  Update employee
  update(id: number, employee: any): Observable<any> {
    return this.http.put(`${this.employeeApiUrl}/${id}`, employee);
  }

  //  Delete employee
delete(id: number): Observable<any> {
  const url = `${this.employeeApiUrl}/${id}`;
  console.log(`Sending DELETE request to: ${url}`);
  return this.http.delete(url);
}

  //  Get employee by email
  getByEmail(email: string): Observable<any> {
    return this.http.get(`${this.employeeApiUrl}/email/${email}`);
  }

  //  Get full attendance history for an employee
  getAttendanceHistory(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.attendanceApiUrl}/employee/${id}`);
  }

  //  Get today’s attendance status for an employee
  getTodayAttendanceStatus(id: number): Observable<any> {
    return this.http.get<any>(`${this.attendanceApiUrl}/today/${id}`);
  }

  updateProfile(id: number, updatedData: any) {
    return this.http.put(`api/employees/${id}`, updatedData);
  }
  updateEmployee(id: number, updatedData: any): Observable<any> {
return this.http.put(`http://localhost:5000/api/employees/${id}`, updatedData);
  }
  getUserRole(email: string): Observable<string> {
    return this.http.get<string>(`http://localhost:5000/api/employees/role/${email}`);
  }
  
  
}

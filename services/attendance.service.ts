import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE_URL = 'http://localhost:5000/api/attendance';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(BASE_URL);
  }

  getTodayAttendance(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:5000/api/attendance/today/${id}`);
  }
  
  getAttendanceHistory(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:5000/api/attendance/employee/${id}`);
  }
  
  create(data: any): Observable<any> {
    return this.http.post(BASE_URL, data);
  }
}

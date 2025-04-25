// leave.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private baseUrl = 'http://localhost:5000/api/leave';
  private adminUrl = 'http://localhost:5000/api/leave/admin';

  // 👇 Subject to broadcast leave list updates
  private leaveUpdatedSource = new Subject<void>();
  leaveUpdated$ = this.leaveUpdatedSource.asObservable();

  constructor(private http: HttpClient) {}

  getAllLeaves(): Observable<any> {
    return this.http.get(`${this.adminUrl}/all`);
  }

  updateLeaveStatus(id: number, status: 'Approved' | 'Rejected'): Observable<any> {
    return this.http.put(`${this.adminUrl}/leave/${id}`, { status });
  }

  getPendingLeaves(employeeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/pending/${employeeId}`);
  }

  applyLeave(leave: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/apply`, leave);
  }

  getLeaveHistory(employeeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${employeeId}/history`);
  }

  // 👇 Method to trigger notification
  notifyLeaveUpdated() {
    this.leaveUpdatedSource.next();
  }
}

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class LeaveService {

  // User endpoints
  private baseUrl = 'http://localhost:5000/api/leave';
  
  // Admin endpoints
  private adminUrl = 'http://localhost:5000/api/leave/admin';

  constructor(private http: HttpClient) {}

  /** ---------- Admin Actions ---------- **/

  // Get all leave requests (Admin)
  getAllLeaves(): Observable<any> {
    return this.http.get(`${this.adminUrl}/all`);
  }

  // Admin Approve or Reject (single method)
  updateLeaveStatus(id: number, status: 'Approved' | 'Rejected'): Observable<any> {
    return this.http.put(`${this.adminUrl}/leave/${id}`, { status });
  }

  /** ---------- User Actions ---------- **/

  // Get pending leaves for an employee (User)
  getPendingLeaves(employeeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/pending/${employeeId}`);
  }

  // Submit leave request (User)
  applyLeave(leave: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/apply`, leave);
  }
  getLeaveHistory(employeeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${employeeId}/history`);
  }

}

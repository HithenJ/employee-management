// src/app/services/admin.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private adminApiUrl = 'http://localhost:5000/api/employees';

  constructor(private http: HttpClient) {}

  // Get all admins (employees)
  getAllAdmins(): Observable<any> {
    return this.http.get(this.adminApiUrl);
  }

  // Get admin by ID
  getAdminById(id: number): Observable<any> {
    return this.http.get(`${this.adminApiUrl}/${id}`);
  }

  // Get admin by email
  getAdminByEmail(email: string): Observable<any> {
    return this.http.get(`${this.adminApiUrl}/email/${email}`);
  }

  // Create new admin
  createAdmin(admin: any): Observable<any> {
    console.log('Sending new admin data to backend:', admin);
    return this.http.post(this.adminApiUrl, admin);
  }

  // Update admin profile
  updateAdminProfile(id: number | string, updatedData: any): Observable<any> {
    console.log('Updating admin profile with data:', updatedData);
    return this.http.put(`${this.adminApiUrl}/${id}`, updatedData);
  }

  // Delete admin
  deleteAdmin(id: number | string): Observable<any> {
    console.log(`Deleting admin with ID: ${id}`);
    return this.http.delete(`${this.adminApiUrl}/${id}`);
  }
}

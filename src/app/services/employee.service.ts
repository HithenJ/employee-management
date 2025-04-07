  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root'
  })
  export class EmployeeService {
    private apiUrl = 'http://localhost:5000/api/employees';

    constructor(private http: HttpClient) {}

    getAll(): Observable<any> {
      return this.http.get(this.apiUrl);
    }

    getById(id: number): Observable<any> {
      return this.http.get(`${this.apiUrl}/${id}`);
    }

    create(employee: any): Observable<any> {
      console.log("Sending to backend:", employee); // 👈 Optional log
      return this.http.post(this.apiUrl, employee);
    }

    update(id: number, employee: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/${id}`, employee);
    }

    delete(id: number): Observable<any> {
      const deleteUrl = `${this.apiUrl}/${id}`;
      console.log(`Sending DELETE request to: ${deleteUrl}`); // Debugging log
      return this.http.delete(deleteUrl);
    }
    

    getByEmail(email: string | null): Observable<any> {
      const safeEmail = (email || '').trim().toLowerCase();
      const encodedEmail = encodeURIComponent(safeEmail);
      return this.http.get(`${this.apiUrl}/email/${encodedEmail}`);
    }
  }

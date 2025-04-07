// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../services/employee.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
  })
export class ProfileComponent implements OnInit {
  employee: any;
  employeeId: string = '';

  constructor(private http: HttpClient, private route: ActivatedRoute,private employeeService: EmployeeService) {}

  ngOnInit() {
    const userEmail = localStorage.getItem('email'); // assuming you stored it after login
    this.employeeService.getByEmail(userEmail!).subscribe(data => {
      this.employee = data;
    });
  }
}

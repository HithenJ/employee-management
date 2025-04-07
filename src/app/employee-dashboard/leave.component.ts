// leaves.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-leaves',
  templateUrl: './leaves.component.html',
})
export class LeavesComponent implements OnInit {
  leaves: any[] = [];
  employeeId: string = '';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.employeeId = this.route.snapshot.params['id'];
    this.http.get(`/api/leaves/${this.employeeId}`).subscribe((data: any) => {
      this.leaves = data;
    });
  }
}

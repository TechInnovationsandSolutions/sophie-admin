import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardServService, ICustomer } from '../shared';
import { ActivatedRoute, Router } from '@angular/router';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: ICustomer[] = [];
  unSortrdCustomers: ICustomer[] = [];
  showPreloader = true;

  tableHeader: string[] = ['first_name', 'email', 'phone', 'created_at', 'id'];
  dataSource: MatTableDataSource<ICustomer>;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private serv: DashboardServService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.serv.getCustomers().then(res => {
      // this.unSortrdCustomers = res as ICustomer[];
      // this.customers = this.unSortrdCustomers.slice();
      this.customers = res as ICustomer[];
      console.log('this.customers', this.customers);
      this.showPreloader = false;
      console.log(this.dataSource);
    }).then(() => {
      // console.log(this.dataSource);
      this.dataSource = new MatTableDataSource(this.customers);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  getCustomerOrders(customer: ICustomer) {
    console.log('this customer', customer);
  }

  sortData(sort: Sort) {
    console.log(sort);
    const data = this.customers.slice();
    if (!sort.active || sort.direction === '') {
      this.customers = data;
      return;
    }

    this.customers = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'created_at': return this.compare(a.created_at, b.created_at, isAsc);
        case 'email': return this.compare(a.email, b.email, isAsc);
        case 'phone': return this.compare(a.phone, b.phone, isAsc);
        case 'first_name': return this.compare(a.first_name, b.first_name, isAsc);
        default: return 0;
      }
    });

    // console.log('sprrt', this.customers);
    // this.dataSource = new MatTableDataSource(this.customers);
  }

  compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}

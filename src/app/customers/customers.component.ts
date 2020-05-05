import { Component, OnInit } from '@angular/core';
import { DashboardServService, ICustomer } from '../shared';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  constructor(private serv: DashboardServService, private route: ActivatedRoute, private router: Router) { }

  customers: ICustomer[] = [];
  showPreloader = true;

  ngOnInit() {
    this.serv.getCustomers().then(res => {
      this.customers = res as ICustomer[];
      console.log('this.customers', this.customers);
      this.showPreloader = false;
    });
  }

  getCustomerOrders(customer: ICustomer) {
    console.log('this customer', customer);
  }
}

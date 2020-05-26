import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardServService, ICustomer, IOrder } from '../shared';

@Component({
  selector: 'app-customer-page',
  templateUrl: './customer-page.component.html',
  styleUrls: ['./customer-page.component.scss']
})
export class CustomerPageComponent implements OnInit {
  showPreloader = true;
  customer: ICustomer = null;
  customerId: number;
  customerOrders: IOrder[];

  constructor(
    private route: ActivatedRoute,
    private serv: DashboardServService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(param => {
      if (param.id) {
        this.customerId = +param.id;
        this.serv.getCustomer(this.customerId).then(res => {
          this.customer = (res as ICustomer[])[0];
          // console.log('this.customers', this.customer);
        }).then(() => {
          // console.log(this.dataSource);
          this.serv.getUserOrders(this.customerId).then(res => {
            // console.log('user order', res);
            this.showPreloader = false;
            this.customerOrders = res as IOrder[];
          });
        });
      }
    });
  }

}

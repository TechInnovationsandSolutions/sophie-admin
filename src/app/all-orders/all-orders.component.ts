import { Component, OnInit } from '@angular/core';
import { IOrder, DashboardServService } from '../shared';

@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.scss']
})
export class AllOrdersComponent implements OnInit {
  orders: IOrder[] = [];
  showPreloader = true;

  constructor(
    private serv: DashboardServService
  ) { }

  ngOnInit() {
    this.serv.getAllOrders()
    .then(res => {
      this.orders = res as any[];
      this.showPreloader = false;
    })
    .catch(rej => console.error(rej));
  }

}

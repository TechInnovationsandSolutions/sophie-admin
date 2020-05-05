import { Component, OnInit } from '@angular/core';
import { DashboardServService } from '../shared';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  showPreloader = true;

  constructor(private serv: DashboardServService) { }

  ngOnInit() {
    this.serv.getAllOrders()
    .then(res => {
      this.orders = res as any[];
      this.showPreloader = false;
    })
    .catch(rej => console.error(rej));
  }

}

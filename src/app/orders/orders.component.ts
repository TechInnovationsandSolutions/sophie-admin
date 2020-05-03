import { Component, OnInit } from '@angular/core';
import { DashboardServService } from '../shared';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  constructor(private serv: DashboardServService) { }

  orders: any[] = [];

  ngOnInit() {
    this.serv.getAllOrders().then(res => {
      this.orders = res as any[];
      console.log('All orders', this.orders);
    });
  }

}

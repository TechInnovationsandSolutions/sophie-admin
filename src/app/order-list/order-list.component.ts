import { Component, OnInit, Input } from '@angular/core';
import { DashboardServService } from '../shared';
import { IOrder } from '../shared/model/order.model';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  @Input() ordersInp: IOrder[];
  @Input() set isUserOrder(val) {
    this.isNotPersonalOrder = val ? false : true;
  }

  orders: IOrder[] = [];
  showPreloader = true;
  isNotPersonalOrder = true;

  constructor() { }

  ngOnInit() {
    this.orders = this.ordersInp;
  }

}

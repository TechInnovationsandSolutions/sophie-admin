import { Component, OnInit, Input } from '@angular/core';
import { DashboardServService } from '../shared';
import { IOrder } from '../shared/model/order.model';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  @Input() set isUserOrder(val) {
    this.isNotPersonalOrder = val ? false : true;
  }

  orders: IOrder[] = [];
  showPreloader = true;
  isNotPersonalOrder = true;

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

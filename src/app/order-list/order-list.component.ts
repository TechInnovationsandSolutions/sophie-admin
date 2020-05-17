import { Component, OnInit, Input } from '@angular/core';
import { IOrder, IOrderDatestamp, IOrderSort } from '../shared/model/order.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

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

  searchText: string;
  showGroupLabel = true;
  groupedByUsername = false;

  groupBy: string;
  filterBy: string;
  sortBy: string;
  searchhTerm: string;

  sumTotalAmt = 0;
  totalOrders = 0;

  theOrders: IOrder[] = [];
  ordersWithDateStamp: IOrderDatestamp[] = [];
  orderSorted: IOrderSort[] = [];
  showPreloader = true;
  isNotPersonalOrder = true;

  chartOptions = {
    scaleShowVerticalLines: false,
    tooltips: {
      callbacks: {
        label(t, d) {
          const xLabel = d.datasets[t.datasetIndex].label;
          const yLabel = t.yLabel >= 1000 ? '₦' + t.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '₦' + t.yLabel;
          return xLabel + ': ' + yLabel;
        }
      }
    },
    scales: {
      yAxes: [{
        ticks: {
          userCallback(value) {
            value = value.toFixed(2);
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return '₦' + value;
          }
        }
      }],
    },
    responsive: true
  };
  chartLabels = [];
  chartType = 'line';
  chartData = [
    {
      data: [],
      label: ''
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(q => {
      if (this.ordersInp.length) {
        if (Object.keys(q).length) {
          this.sortBy = q.sortBy ? q.sortBy : '';
          this.filterBy = q.filterBy ? q.filterBy : '';
          this.groupBy = q.groupBy ? q.groupBy : '';
        }

        const aProm = new Promise((r) => {
          // Sort
          this.theOrders = this.sortByfn(this.ordersInp);
          r(this.theOrders);
        });

        aProm.then(() => {
          // Filter
          const deOrders = this.filterByFn();
          return deOrders;
        })
        .then((res) => {
          if (q.searchhTerm) {
            this.searchText = q.searchhTerm;
            return this.searchFn(res);
          }
          return res;
        })
        .then((res) => {
          // Convert to data to have day, year, etc stamp
          this.totalOrders = res.length;
          this.sumTotalAmt = this.sumTotal(res);
          console.log('ordersWithDateStamp b4', res);
          this.ordersWithDateStamp = res.map(o => {
            const orderDateStamp: IOrderDatestamp = {
              order: o,
              day: this.calcDay(o.created_at),
              week: this.calcWeekNo(o.created_at),
              month: this.calcMonth(o.created_at),
              year: this.calcYear(o.created_at)
            };

            return orderDateStamp;
          });
          return this.ordersWithDateStamp;
        })
        .then(() => {
          // Group by
          this.groupByFn();
          this.populateChart();
        });
      }
    });
  }

  calcDay(dateVal: Date | string) {
    let output = 'none';
    if (dateVal) {
      const date = new Date(dateVal);
      const dateStr = `${date}`;
      const ind = dateStr.indexOf('GMT'); // Get indexOf GMT
      let dateFormat = dateStr.substring(0, ind - 10); // Gives just date
      dateFormat = dateFormat.trim(); // + ' (GMT)';
      output = dateFormat;
    }
    return output;
  }

  calcWeekNo(dataStamp: Date | string) {
    const dt = new Date(dataStamp);
    const tdt = new Date(dt.valueOf());
    const dayn = (dt.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    const firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
      tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    // 604800000 is 1 week in milliseconds
    return 1 + Math.ceil((firstThursday - tdt.getTime()) / 604800000);
  }

  calcMonth(dataStamp: Date | string) {
    let  finMonth = '';
    const monthIndex = new Date(dataStamp).getMonth() + 1;
    const monthIndexValue = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12
    };

    for (const key in monthIndexValue) {
      if (monthIndex === monthIndexValue[key]) {
        finMonth = key;
      }
    }

    return finMonth;
  }

  calcYear(dataStamp: Date | string) {
    return new Date(dataStamp).getFullYear();
  }

  searchFn(orders: IOrder[]) {
    if (this.searchText) {
      const searchArr = orders.filter(r => {
        const search = this.searchText.toLowerCase();
        const uFirstName = r.user.first_name.toLowerCase();
        const uLastName = r.user.last_name.toLowerCase();
        const uName = uFirstName + ' ' + uLastName;
        const isInFirstName = uFirstName.indexOf(search);
        const isInLastName = uLastName.indexOf(search);
        const isInName = uName.indexOf(search);
        const isInRef = r.payment.reference.indexOf(this.searchText);

        if (isInFirstName > -1 || isInLastName > -1 || isInName > -1  || isInRef > -1) {
          return r;
        }
      });
      return searchArr;
    }
    return orders;
  }

  filterByFn() {
    if (!this.filterBy || this.filterBy === 'all') {
      return this.theOrders.slice(0);
    } else if (this.filterBy === 'paid') {
      return this.theOrders.filter(o => o.payment.status === true);
    } else if (this.filterBy === 'unpaid') {
      return this.theOrders.filter(o => o.payment.status === false);
    }
  }

  sortByfn(orders: IOrder[]) {
    return this.sortBy === 'asc' ? this.sortByDateAsc(orders) : this.sortByDateDesc(orders);
  }

  sortByDateDesc(arr: IOrder[]) {
    const sortedArr = arr.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sortedArr;
  }

  sortByDateAsc(arr: IOrder[]) {
    return this.sortByDateDesc(arr).reverse();
  }

  groupByFn() {
    this.showGroupLabel = true;
    this.groupedByUsername = false;
    this.orderSorted = [];

    console.log('groupBy', this.groupBy);

    switch (this.groupBy) {
      case 'day':
      case 'week':
      case 'month':
      case 'year':
        this.orderSorted = this.groupByPeriod(this.groupBy);
        break;
      case 'firstNameLetter':
        this.orderSorted = this.groupByUserFirstLetter();
        break;
      case 'users':
        this.groupedByUsername = true;
        this.orderSorted = this.groupByUser();
        break;
      default:
        this.showGroupLabel = false;
        this.groupByNone();
        break;
    }
  }

  groupByNone() {
    this.orderSorted = [
      {
        criteria: null,
        totAmt: null,
        orders: this.ordersWithDateStamp
      }
    ];
  }

  groupByPeriod(period: string) {
    const pk = new Set();
    this.ordersWithDateStamp.slice(0).map(t => pk.add(t[period]));
    const pkArr = Array.from(pk);
    const yy = [];
    pkArr.forEach(pky => {
      const alpha = pky;
      let sumOfItems = 0;

      const ee = this.ordersWithDateStamp.slice(0).filter(t => t[period] === alpha);
      const ff = ee.map(e => e.order);
      ff.forEach(element => {
          sumOfItems += +element.cost; // Turn the string to number
      });
      yy.push(
        new Object({
          criteria: period + ' ' + alpha,
          orders : ee,
          totAmt: sumOfItems
        })
      );
      // console.log(yy);
    });

    return yy as IOrderSort[];
  }

  groupByUser() {
    const pk = new Set();
    this.ordersWithDateStamp.map(t => pk.add(t.order.user.first_name + ' ' + t.order.user.last_name));
    const pkArr = Array.from(pk);
    const yy = [];
    pkArr.forEach(pky => {
      const alpha = pky;
      let sumOfItems = 0;

      const ee = this.ordersWithDateStamp.filter(t => (t.order.user.first_name + ' ' + t.order.user.last_name) === alpha);
      const ff = ee.map(e => e.order);
      ff.forEach(element => {
          sumOfItems += +element.cost; // Turn the string to number
      });
      yy.push(
        new Object({
          criteria: alpha,
          orders : ee,
          totAmt: sumOfItems
        })
      );
      // console.log(yy);
    });

    return yy as IOrderSort[];
  }

  groupByUserFirstLetter() {
    const pk = new Set();
    this.ordersWithDateStamp.map(t => pk.add(t.order.user.first_name[0].toLocaleLowerCase()));
    const pkArr = Array.from(pk);
    const yy = [];
    pkArr.forEach(pky => {
      const alpha = pky;
      let sumOfItems = 0;

      const ee = this.ordersWithDateStamp.filter(t => t.order.user.first_name[0].toLocaleLowerCase() === alpha);
      const ff = ee.map(e => e.order);
      ff.forEach(element => {
          sumOfItems += +element.cost; // Turn the string to number
      });
      yy.push(
        new Object({
          criteria: (alpha as string).toUpperCase(),
          orders : ee,
          totAmt: sumOfItems
        })
      );
      // console.log(yy);
    });

    return yy as IOrderSort[];
  }

  setGroupBy(val: string) {
    this.router.navigate([], {
      queryParams: {
        groupBy: val
      },
      queryParamsHandling: 'merge'
    });
  }

  setFilterBy(val: string) {
    this.router.navigate([], {
      queryParams: {
        filterBy: val
      },
      queryParamsHandling: 'merge'
    });
  }

  setSortBy(val: string) {
    this.router.navigate([], {
      queryParams: {
        sortBy: val
      },
      queryParamsHandling: 'merge'
    });
  }

  searchFormSubmit() {
    // if (this.searchText) {
    this.router.navigate([], {
      queryParams: {
        searchhTerm: this.searchText,
      },
      queryParamsHandling: 'merge'
    });
    // }
  }

  sumTotal(arr: IOrder[]) {
    let totAmt = 0;
    arr.map(a => {
      totAmt += +a.cost;
    });

    return totAmt;
  }

  populateChart() {
    console.log('ee', this.orderSorted);
    if (this.orderSorted.length) {
      let ords = this.orderSorted.slice(0);
      if (this.orderSorted.length === 1 && !this.orderSorted[0].criteria) {
        ords = this.groupByPeriod('day');
      }
      const criteria = ords.map(o => o.criteria);
      // const val = ords.map(o => this.currencyPipe.transform(o.totAmt, '₦ '));
      const val = ords.map(o => o.totAmt);

      this.chartLabels = criteria.length ? criteria : ['orders'];
      this.chartData = [
        {
          data: val,
          label: this.groupBy ? this.groupBy[0].toUpperCase() + this.groupBy.substring(1) : ''
        }
      ];

      console.log('this.chartLabels', this.chartLabels);
      console.log('this.chartData', this.chartData);
    }
  }
}

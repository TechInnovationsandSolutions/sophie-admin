import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ICategory } from 'src/app/shared';
import { DataTableDirective } from 'angular-datatables';

import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { DashboardServService } from 'src/app/shared/services/dashboard-serv.service';


@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories:ICategory[] = [];
  // dtElement: DataTableDirective;
  // dtOptions:DataTables.Settings = {};
  dataTable: any;

  constructor(private serv: DashboardServService, private chRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.serv.getCatgories().then(res=>{
      this.categories = <ICategory[]>res;
      console.log('this.categories', this.categories);


      this.chRef.detectChanges();

      // Now you can use jQuery DataTables :
      const table: any = $('table#category-table');
      this.dataTable = table.DataTable();
    }).catch(err=>console.error(err))
    // this.dtOptions = {
    //   pagingType: 'full_numbers',
    //   responsive: true,
    //   serverSide: true,
    //   processing: true,
    //   columns: [{ data: 'id' }, { data: 'Name' }]
    // };
  }

  // ngAfterViewInit(): void {
  //   this.dtElement.dtInstance.then((dtInstance: any) => {
  //     console.info("foobar");
  //     dtInstance.columns.adjust()
  //        .responsive.recalc();
  //   });
  // }

  editCategory(cat:ICategory){
    console.log(cat);
  }

}

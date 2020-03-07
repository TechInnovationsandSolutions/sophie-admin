import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ICategory } from 'src/app/shared';
import { DataTableDirective } from 'angular-datatables';

import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { DashboardServService } from 'src/app/shared/services/dashboard-serv.service';
import Swal from 'sweetalert2'
import { Router } from '@angular/router';


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

  constructor(private serv: DashboardServService, private chRef: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {
    this.serv.getCatgories().then(res=>{
      this.categories = <ICategory[]>res;
      console.log('this.categories', this.categories);


      this.chRef.detectChanges();

      // Now you can use jQuery DataTables :
      const table: any = $('table#category-table');
      this.dataTable = table.DataTable({
        destroy: true,
        responsive: true,
        "ordering": false
      });
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
    this.serv._category = cat;
    this.router.navigate(['/category/edit'], {
      queryParams:{
        category: cat.id
      }
    })
  }

  deleteCategory(cat:ICategory){
    console.log(cat);

    Swal.fire({
      title: 'Confirmation',
      text: "You want to delete " + cat.name + " Category?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#dc3545',
      cancelButtonColor:'#28a745'
    }).then((result) => {
      if (result.value) {
        this.serv.deleteCategory(cat.id.toString()).then(res=>console.log(res)).then(()=>{
          Swal.fire(
            'Deleted!',
            'Category '+ cat.name + 'has been deleted.',
            'success'
          ).then(()=>{
            location.reload();
          })
        }).catch(err=>Swal.fire({
          title: 'Error',
          icon: 'error',
          text:err
        }))
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Swal.fire(
          'Cancelled',
          'operation aborted',
          'info'
        )
      }
    })
  }

  productCatList(cat:ICategory){
    this.router.navigate(['/category', cat.id, 'products'], {queryParams:{page:1}});
    // location.reload();
  }
}

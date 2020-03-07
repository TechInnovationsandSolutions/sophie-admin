import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ITag, DashboardServService } from 'src/app/shared';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs4';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-tags',
  templateUrl: './list-tags.component.html',
  styleUrls: ['./list-tags.component.scss']
})
export class ListTagsComponent implements OnInit {
  tags:ITag[] = [];
  dataTable: any;

  constructor(private serv: DashboardServService, private chRef: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {
    this.serv.getAllTags().then(res=>{
      this.tags = <ITag[]>res;
      console.log('this.tags', this.tags);

      this.chRef.detectChanges();

      // Now you can use jQuery DataTables :
      const table: any = $('table#tag-table');
      this.dataTable = table.DataTable({
        destroy: true,
        responsive: true,
        "ordering": false
      });
    }).catch(err=>console.error(err))
  }
  
  editTag(tag:ITag){
    console.log(tag);
    this.serv._tag = tag;
    this.router.navigate(['/tag/edit'], {
      queryParams:{
        Tag: tag.id
      }
    })
  }

  deleteTag(tag:ITag){
    console.log(tag);

    Swal.fire({
      title: 'Confirmation',
      text: "You want to delete " + tag.name + " Tag?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete!',
      cancelButtonText: 'No, cancel!',
      confirmButtonColor: '#dc3545',
      cancelButtonColor:'#28a745'
    }).then((result) => {
      if (result.value) {
        this.serv.deleteTag(tag.id).then(res=>console.log(res)).then(()=>{
          Swal.fire(
            'Deleted!',
            'Tag '+ tag.name + 'has been deleted.',
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

  productTagList(tag:ITag){
    this.router.navigate(['/tag', tag.id, 'products'], {queryParams:{page:1}});
    // location.reload();
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2'
import { ActivatedRoute } from '@angular/router';
import { DashboardServService, ITag } from 'src/app/shared';

@Component({
  selector: 'app-create-tags',
  templateUrl: './create-tags.component.html',
  styleUrls: ['./create-tags.component.scss']
})
export class CreateTagsComponent implements OnInit {

  constructor(private fb:FormBuilder, private cd: ChangeDetectorRef, private route:ActivatedRoute, private serv:DashboardServService) { }

  tagForm = this.fb.group({
    name:['', Validators.required],
    id: [''],
  })

  isCreate:boolean =  true;

  ngOnInit() {
    // if(this.route.snapshot.params.fn == 'edit' && this.route.snapshot.queryParams.category){
    //   this.serv.getTag(this.route.snapshot.queryParams.tag.toString()).then(res=>{
    //     const theTag = <ITag>res;
    //     this.tagForm.patchValue({
    //       name: theTag.name,
    //     });

    //     //  console.log(this.tagForm.value, this.tagForm.valid);

    //     this.isCreate = false;
    //   }, err=>console.error(err));
    // }

    if(this.route.snapshot.params.fn == 'edit' && this.serv._tag){
      const theTag:ITag = this.serv._tag;
      this.serv._tag = null;

      this.tagForm.patchValue({
        name: theTag.name,
      });
      this.isCreate = false;
    }
  }

  
  createNewTag(tag:ITag){
    Swal.fire({
      title: 'Confirmation',
      text: "You want to create a new tag by name - " + tag.name + "?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.value) {
        this.serv.createTag(tag.name).then(res=>console.log(res)).then(()=>{
          Swal.fire(
            'Created!',
            'tag '+ tag.name + 'has been successfully created.',
            'success'
          ).then(()=>location.reload())
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

  updateNewTag(tag:ITag){
    Swal.fire({
      title: 'Confirmation',
      text: "You want to update the details of " + tag.name + "?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Update!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.value) {
        this.serv.updateTag(tag.name).then(res=>console.log(res)).then(()=>{
          Swal.fire(
            'Updated!',
            'tag '+ tag.name + 'has been successfully update.',
            'success'
          ).then(()=>location.reload())
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

  onSubmit(formValue){
    // e.preventDefault();
    // console.log(this.swal)

    this.isCreate ? this.createNewTag(formValue) : this.updateNewTag(formValue);
  }
}

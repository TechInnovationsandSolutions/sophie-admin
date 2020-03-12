import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2'
import { ActivatedRoute } from '@angular/router';
import { DashboardServService, ICategory } from 'src/app/shared';

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.scss']
})
export class CreateCategoryComponent implements OnInit {
  
  constructor(private fb:FormBuilder, private cd: ChangeDetectorRef, private route:ActivatedRoute, private serv:DashboardServService) { }

  categoryForm = this.fb.group({
    name:['', Validators.required],
    image: ['', Validators.required],
    id: [''],
  })

  isCreate:boolean =  true;
  showInputFile:boolean =  true;

  ngOnInit() {
    if(this.route.snapshot.params.fn == 'edit' && this.route.snapshot.queryParams.category){
      this.serv.getCatgory(this.route.snapshot.queryParams.category.toString()).then(res=>{
        const theCategory = <ICategory>res;
        this.categoryForm.patchValue({
          name: theCategory.name,
          image: theCategory.image,
          id: theCategory.id
        });

        setTimeout(() => {
          const imgElem = <HTMLImageElement>document.getElementById('imgPreview');
          console.log('imhh', imgElem)
          imgElem.src = theCategory.image;
          this.showInputFile = false;
         }, 500);

         console.log(this.categoryForm.value, this.categoryForm.valid)

        this.isCreate = false;
      }, err=>console.error(err));
    }
  }

  getSlug(cat_name:string){
    return cat_name.split(' ').join('-').toLowerCase();
  }

  onFileChange(event) {
    const reader = new FileReader();
 
    if(event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      // console.log('file',file)
      // console.log('reader',reader)
      console.log('file URL',URL.createObjectURL(file))
  
      reader.onload = () => {
        this.categoryForm.patchValue({
          image: reader.result
       });

       console.log('frm', this.categoryForm.value);

       setTimeout(() => {
        const imgElem = <HTMLImageElement>document.getElementById('imgPreview');
        console.log('imhh', imgElem)
        imgElem.src = URL.createObjectURL(file);
        this.showInputFile = false;
       }, 500);
      
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }

  removeImg(){
    this.categoryForm.patchValue({
      img: null
    });

    this.showInputFile = true;

    <HTMLInputElement><unknown>document.getElementById('category-img').setAttribute('value', null)

   console.log('frm', this.categoryForm.value);
  }

  createNewCategory(category:ICategory){
    Swal.fire({
      title: 'Confirmation',
      text: "You want to create a new Category by name - " + category.name + "?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.value) {
        this.serv.createCategory(category).then(res=>console.log(res)).then(()=>{
          Swal.fire(
            'Created!',
            'Category '+ category.name + 'has been successfully created.',
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

  updateNewCategory(category:ICategory){
    Swal.fire({
      title: 'Confirmation',
      text: "You want to update the details of " + category.name + "?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Update!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.value) {
        this.serv.updateCategory(category).then(res=>console.log(res)).then(()=>{
          Swal.fire(
            'Updated!',
            'Category '+ category.name + 'has been successfully update.',
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
    formValue.slug = this.getSlug(formValue.name);

    this.isCreate ? this.createNewCategory(formValue) : this.updateNewCategory(formValue);
  }
}
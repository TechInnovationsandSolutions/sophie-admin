import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.scss']
})
export class CreateCategoryComponent implements OnInit {
  
  constructor(private fb:FormBuilder, private cd: ChangeDetectorRef) { }

  categoryForm = this.fb.group({
    name:['', Validators.required],
    img: ['', Validators.required]
  })

  ngOnInit() {
    
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
          img: reader.result
       });

       console.log('frm', this.categoryForm.value);

       setTimeout(() => {
        const imgElem = <HTMLImageElement>document.getElementById('imgPreview');
        console.log('imhh', imgElem)
        imgElem.src = URL.createObjectURL(file);
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

    <HTMLInputElement><unknown>document.getElementById('category-img').setAttribute('value', null)

   console.log('frm', this.categoryForm.value);
  }

  onSubmit(formValue){
    // e.preventDefault();
    // console.log(this.swal)
    formValue.slug = this.getSlug(formValue.name);
    Swal.fire({
      title: 'Confirmation',
      text: "You want to create a new Category by name - " + formValue.name + "?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.value) {
        Swal.fire(
          'Created!',
          'Category '+ formValue.name + 'has been deleted.',
          'success'
        )
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
}
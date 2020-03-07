import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ICategory } from './../../shared'
import { FormBuilder, Validators } from '@angular/forms';
import Swal from "sweetalert2";

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit {

  productCatgories: ICategory[] = []

  constructor(private fb: FormBuilder, private cd:ChangeDetectorRef) { }

  productForm = this.fb.group({
    productName: ['', Validators.required],
    productImg: ['', Validators.required],
    productCategory: [''],
    productPrice: ['', Validators.required],
    productPromoPrice: ['', Validators.required],
    productDescription: ['', Validators.required],
    productExcerpt: ['', Validators.required],
    productQuantity: ['', Validators.required]
  })

  ngOnInit() {
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
        this.productForm.patchValue({
          productImg: reader.result
       });

       console.log('frm', this.productForm.value);

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

  onSubmit(formValue){
    Swal.fire({
      title: 'Confirmation',
      text: "You want to create a new Product by name - " + formValue.productName + "?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create!',
      cancelButtonText: 'No, cancel!',
    }).then((result) => {
      if (result.value) {
        console.log('product', formValue);
        Swal.fire(
          'Created!',
          'Product '+ formValue.productName + 'has been deleted.',
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

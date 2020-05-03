import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  isAddCategory = false;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    if (this.route.snapshot.params) {
      let fn = this.route.snapshot.params.fn;
      if (fn == 'add' || fn == 'edit') {
        this.isAddCategory = true;
      } else {
        this.router.navigate(['/categories']);
      }
    }
  }

  showAddCategory() {
    // this.isAddCategory = true;
    this.router.navigate(['/category/add']);
  }

  hideAddCategory() {
    // this.isAddCategory = false;
    this.router.navigate(['/categories']);
  }
}

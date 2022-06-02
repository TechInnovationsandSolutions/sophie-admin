import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) { }

  isAddTag = false;

  ngOnInit() {
    if (this.route.snapshot.params) {
      const fn = this.route.snapshot.params.fn;
      if (fn === 'add' || fn === 'edit') {
        this.isAddTag = true;
      } else {
        this.router.navigate(['/tags']);
      }
    }
  }

  showAddTag() {
    // this.isAddTag = true;
    this.router.navigate(['/tag/add']);
  }

  hideAddTag() {
    // this.isAddTag = false;
    this.router.navigate(['/tags']);
  }

}

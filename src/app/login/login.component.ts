import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardServService, AuthService } from '../shared';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  constructor(
    private router: Router,
    private serv: DashboardServService,
    private auth: AuthService,
    private route: ActivatedRoute
  ) { }

  email: string;
  password: string;
  msg = '';
  // tslint:disable-next-line: variable-name
  url_route = '';

  ngOnInit() {
    this.url_route = this.route.snapshot.queryParams.redirectUrl ? this.route.snapshot.queryParams.redirectUrl : '/dashboard';
  }

  formFocus(): void {
    this.msg = '';
  }

  submitForm() {
    const emailRegEx = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$');
    if (emailRegEx.test(this.email) && this.password) {
      this.tryLogin(this.email, this.password);
    }
  }

  tryLogin(email: string, password: string) {
    this.blockUI.start('Please Wait...');
    this.auth.login(email, password).then(r => {
      this.blockUI.stop();
      if (r.data.token && r.data.is_admin) {
        this.auth.setToken(r.data.token, email);
        this.router.navigateByUrl(this.url_route);
      } else {
        this.msg = 'Email or Password is incorrect.';
      }
    },
    r => {
      this.blockUI.stop();
      this.msg = 'Email or Password is incorrect.';
    });
  }
}

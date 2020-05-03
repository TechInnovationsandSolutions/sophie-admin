import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardServService, AuthService } from '../shared';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private serv: DashboardServService, private auth: AuthService, private route: ActivatedRoute) { }

  email: string;
  password: string;
  msg = '';
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
    this.auth.login(email, password).subscribe(
      r => {
        if (r.data.token && r.data.is_admin) {
          this.serv.setToken(r.data.token);
          this.router.navigateByUrl(this.url_route);
        }
    },
    r => {
      this.msg = 'Email or Password is incorrect.';
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardServService } from './dashboard-serv.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
  _url = this.serv._url;

  constructor(
    private http: HttpClient,
    private serv: DashboardServService,
    private router: Router
  ) {}


  login(email: string, password: string) {
    return this.http.post<any>(this._url + 'auth/login', {
      email,
      password
    }).toPromise();
  }

  logOut() {
    this.serv.removeToken();
    this.router.navigate(['/login']);
  }
}

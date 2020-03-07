import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { DashboardServService } from './dashboard-serv.service';

@Injectable()
export class AuthService {
    constructor(private http: HttpClient, private serv: DashboardServService){}

    _url = this.serv._url;

    login(email: string, password: string): Observable<any>{
        return this.http.post<any>(this._url + 'auth/login', {
          email: email,
          password: password
        });
    }
}
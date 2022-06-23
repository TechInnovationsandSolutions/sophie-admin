import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { CrispyService } from "./encryption.service";

const TOKEN = "x-admin-token";
const loco = "x35&#";
const polish = "ad-spt";

@Injectable()
export class AuthService {
  // tslint:disable-next-line: variable-name
  // _url = 'https://tis-bandb.herokuapp.com/api/v1/';
  // _url = "https://api.sophiesbathandbody.com/";
  _url = "https://api.stmbeautyandbath.com/api/v1/";

  constructor(
    private http: HttpClient,
    private router: Router,
    private crispyService: CrispyService
  ) {}

  setToken(token: string, emailLog: string) {
    const user = this.crispyService.encryptyCrypto(emailLog, loco + TOKEN);
    const userToken = this.crispyService.encryptyCrypto(token, loco + user);
    localStorage.setItem(user, userToken);
    localStorage.setItem(polish, user);
  }

  getToken() {
    const user = localStorage.getItem(polish);
    const tk = localStorage.getItem(user);
    if (user && tk) {
      const userToken: string = this.crispyService.decryptyCrypto(
        tk,
        loco + user
      );
      return userToken;
    }
    return;
  }

  removeToken() {
    localStorage.removeItem(polish);
  }

  login(email: string, password: string) {
    return this.http
      .post<any>(this._url + "auth/login", {
        email,
        password,
      })
      .toPromise();
  }

  logOut() {
    this.removeToken();
    this.router.navigate(["/login"]);
  }
}

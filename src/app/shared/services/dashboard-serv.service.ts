import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";

const TOKEN = 'x-token';

@Injectable({
  providedIn: 'root'
})
export class DashboardServService {
  private pageNoOfProduct = 20; 
  constructor(private http: HttpClient) { }

  _url = 'https://tis-bandb.herokuapp.com/api/v1/'; //Base URL

  setToken(token: string): void {
    localStorage.setItem(TOKEN, token);
  }

  getToken(){
    return localStorage.getItem(TOKEN);
  }

  removeToken(){
    localStorage.removeItem(TOKEN);
  }

  isLogged() {
    return localStorage.getItem(TOKEN) != null;
  }

  getCatgories(){
    return new Promise(resolve=>{
      this.http.get<any>(this._url + 'categories').subscribe(
        res=>{
          console.log(res);
          if (res.status == 'success') {
            resolve(res.data);
          }
        }, 
        (err: HttpErrorResponse)=>{
          console.log(err.error);
        }
      )
    })
  }

  getProducts(param:string){
    return new Promise(resolve=>{
      this.http.get<any>(this._url + 'products', {
        params: new HttpParams().set('page', param)
      }).subscribe(
        res=>{
          console.log(res);
          if (res.status == 'success') {
            res.data.pg = this.numberOfProductPages(res.data.total)
            resolve(res.data);
          }
        }, 
        (err: HttpErrorResponse)=>{
          console.log(err.error);
        }
      )
    })
  }

  numberOfProductPages(totalNo){
    const no = Math.ceil(totalNo/this.pageNoOfProduct);
    return new Array(no).fill(1); //Thank you Leonardo Giroto

  }
}

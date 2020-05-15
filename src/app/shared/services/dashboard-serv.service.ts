import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ICategory, IProduct, ITag } from '../model';
import { cloudinaryConfig } from './../../configs';

const TOKEN = 'x-admin-token';

@Injectable({
  providedIn: 'root'
})
export class DashboardServService {
  private pageNoOfProduct = 20;
  constructor(private http: HttpClient, private router: Router) { }

  // tslint:disable-next-line: variable-name
  _url = 'https://tis-bandb.herokuapp.com/api/v1/'; // Base URL
  cloudinary = cloudinaryConfig;

  // Temporary data
  // tslint:disable-next-line: variable-name
  _category: ICategory;
  // tslint:disable-next-line: variable-name
  _product: IProduct;
  // tslint:disable-next-line: variable-name
  _tag: ITag;

  setToken(token: string): void {
    localStorage.setItem(TOKEN, token);
  }

  getToken() {
    return localStorage.getItem(TOKEN);
  }

  removeToken() {
    localStorage.removeItem(TOKEN);
  }

  isLogged() {
    return localStorage.getItem(TOKEN) != null;
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }

  numberOfProductPages(totalNo) {
    const no = Math.ceil(totalNo / this.pageNoOfProduct);
    return new Array(no).fill(1); // Thank you Leonardo Giroto
  }

  // Category fns
  getCatgory(id) {
    return new Promise((resolve, reject) => {
      this.http.get<any>(this._url + 'categories/' + id).subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            resolve(res.data);
          } else if (res.code === 401) {
            this.removeToken();
            this.backToLogin();
          } else {
            reject(res);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  getCatgories() {
    return new Promise(resolve => {
      this.http.get<any>(this._url + 'categories').subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            resolve(res.data);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  createCategory(category: ICategory) {
    return new Promise(resolve => {
      this.http.post('https://api.cloudinary.com/v1_1/' + cloudinaryConfig.cloud_name  + '/image/upload/', {
        file:  category.image,
        public_id: 'category-' + category.name,
        upload_preset : cloudinaryConfig.upload_preset
      }).subscribe(resp => {
        const response = resp as any;
        console.log('cloudy', response);

        // tslint:disable-next-line: max-line-length
        const img_thumbnail = (response.eager && response.eager[0].secure_url) ? response.eager[0].secure_url : response.secure_url.split('upload/').join('upload/c_scale,w_150/');

        const token = this.getToken();
        this.http.post<any>(this._url + 'categories', {
          name: category.name,
          picture: {
            url: response.secure_url,
            thumbnail: img_thumbnail
          }
        },
        {
          headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
        })
        .subscribe(
          res => {
            console.log(res);
            if (res.status === 'success') {
              resolve(res);
            }
          },
          (err: HttpErrorResponse) => {
            console.log(err);
            if (err.status === 401) {
              this.removeToken();
              this.backToLogin();
            }
          }
        );
      });
    });
  }

  updateCategory(category: ICategory) {
    return new Promise(resolve => {
      this.http.post('https://api.cloudinary.com/v1_1/' + cloudinaryConfig.cloud_name  + '/image/upload/', {
        file:  category.image, public_id: 'category-' + category.name,
        upload_preset : cloudinaryConfig.upload_preset
      }).subscribe(resp => {
        const response = resp as any;
        console.log('cloudy', response);

        // tslint:disable-next-line: max-line-length
        const img_thumbnail = (response.eager && response.eager[0].secure_url) ? response.eager[0].secure_url : response.secure_url.split('upload/').join('upload/c_scale,w_150/');

        const token = this.getToken();
        this.http.put<any>(this._url + 'categories/' + category.id, {
          name: category.name,
          picture: [{
            url: response.secure_url,
            thumbnail: img_thumbnail
          }]
        },
        {
          headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
        })
        .subscribe(
          res => {
            console.log(res);
            if (res.status === 'success') {
              resolve(res);
            }
          },
          (err: HttpErrorResponse) => {
            console.log(err);
            if (err.status === 401) {
              this.removeToken();
              this.backToLogin();
            }
          }
        );
      });
    });
  }

  deleteCategory(id: string) {
    return new Promise(resolve => {
      const token = this.getToken();
      this.http.delete<any>(this._url + 'categories/' + id,
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            resolve(res);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }


// products
  getProducts(param: string) {
    return new Promise(resolve => {
      this.http.get<any>(this._url + 'products', {
        params: new HttpParams().set('page', param)
      }).subscribe(
        res => {
          // console.log('opo', res);
          if (res.status === 'success') {
            const response = res.data;
            // console.log('response', response);
            response.pg = this.numberOfProductPages(response.total);
            // console.log('kajd', response);
            resolve(response);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  getSearchedProducts(searchTerm: string, param: string) {
    return new Promise(resolve => {
      this.http.get<any>(this._url + 'products/search', {
        params: new HttpParams().set('search', searchTerm).set('page', param)
      }).subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            res.data.pg = this.numberOfProductPages(res.data.total);
            resolve(res.data);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  getProductsByCategory(catid: number, param: string) {
    return new Promise(resolve => {
      this.http.get<any>(this._url + 'categories/' + catid + '/products', {
        params: new HttpParams().set('page', param)
      }).subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            res.data.pg = this.numberOfProductPages(res.data.total);
            resolve(res.data);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  getProductsByTag(tagName: string) {
    return new Promise(resolve => {
      this.http.post<any>(this._url + 'products/tags', {
        tag: tagName
      }).subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            res.data.pg = this.numberOfProductPages(res.data.total);
            resolve(res.data);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  getProduct(id) {
    return new Promise((resolve, reject) => {
      this.http.get<any>(this._url + 'products/' + id).subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            resolve(res.data);
          } else if (res.code === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          } else {
            reject(res);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  createProduct(product: IProduct) {
    return new Promise(resolve => {
      this.http.post('https://api.cloudinary.com/v1_1/' + cloudinaryConfig.cloud_name  + '/image/upload/', {
        file:  product.images[0].url,
        public_id: 'product-' + product.name,
        upload_preset : cloudinaryConfig.upload_preset
      }).subscribe(resp => {
        const response = resp as any;
        console.log('cloudy', response);

        const img_thumbnail = (response.eager && response.eager[0].secure_url) ? response.eager[0].secure_url : response.secure_url.split('upload/').join('upload/c_scale,w_150/');

        const token = this.getToken();
        this.http.post<any>(this._url + 'products', {
          name: product.name,
          category_id: product.category.id,
          description: product.description,
          excerpts: product.excerpt,
          cost: product.cost,
          discount: Math.floor(+product.discount * 100),
          image: {
            url: response.secure_url,
            title: response.public_id,
            thumbnail: img_thumbnail
          },
          quantity: product.quantity,
          tags: product.formTags
        },
        {
          headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
        })
        .subscribe(
          res => {
            console.log(res);
            if (res.status === 'success') {
              resolve(res);
            }
          },
          (err: HttpErrorResponse) => {
            console.log(err);
            if (err.status === 401) {
              this.removeToken();
              this.backToLogin();
            }
          }
        );
      });
    });
  }

  updateProduct(product: IProduct) {
    return new Promise(resolve => {
      this.http.post('https://api.cloudinary.com/v1_1/' + cloudinaryConfig.cloud_name  + '/image/upload/', {
        file:  product.images[0].url,
        public_id: 'product-' + product.name, upload_preset : cloudinaryConfig.upload_preset
      }).subscribe(resp => {
        const response = resp as any;
        console.log('cloudy', response);

        const img_thumbnail = (response.eager && response.eager[0].secure_url) ? response.eager[0].secure_url : response.secure_url.split('upload/').join('upload/c_scale,w_150/');

        const token = this.getToken();
        this.http.put<any>(this._url + 'products/' + product.id, {
          name: product.name,
          category_id: product.category.id,
          description: product.description,
          excerpts: product.excerpt,
          cost: product.cost,
          discount: Math.floor(+product.discount * 100),
          image: {
            url: response.secure_url,
            title: response.public_id,
            thumbnail: img_thumbnail
          },
          quantity: product.quantity,
          tags: product.formTags
        },
        {
          headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
        })
        .subscribe(
          res => {
            console.log(res);
            if (res.status === 'success') {
              resolve(res);
            }
          },
          (err: HttpErrorResponse) => {
            console.log(err.error);
          }
        );
      });
    });
  }

  deleteProduct(id) {
    return new Promise((resolve, reject) => {
      const token = this.getToken();
      this.http.delete<any>(this._url + 'products/' + id, {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      }).subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            resolve(res.data);
          } else if (res.code === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          } else {
            reject(res);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  // tags
  getAllTags() {
    return new Promise(resolve => {
      const token = this.getToken();
      this.http.get<any>(this._url + 'tags',
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            const set = new Set();
            console.log('res data', res.data);
            (res.data as any[]).forEach(r => set.add(r));
            console.log('we set', set);
            res.data = Array.from(set);
            resolve(res.data);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  createTag(tagName: string) {
    return new Promise(resolve => {
      const token = this.getToken();
      this.http.post<any>(this._url + 'tags', {
        name: tagName,
      },
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            resolve(res);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  updateTag(tagName: string) {
    return new Promise(resolve => {
      const token = this.getToken();
      this.http.put<any>(this._url + 'tags', {
        name: tagName,
      },
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            resolve(res);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  deleteTag(tagId: number) {
    return new Promise(resolve => {
      const token = this.getToken();
      this.http.delete<any>(this._url + 'tags/' + tagId,
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            resolve(res);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  getTag(id) {
    return new Promise((resolve, reject) => {
      this.http.get<any>(this._url + 'tags/' + id).subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            resolve(res.data);
          } else if (res.code === 401) {
            this.removeToken();
            this.backToLogin();
          } else {
            reject(res);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  // Get all user => Customer
  getCustomers() {
    return new Promise(resolve => {
      const token = this.getToken();
      this.http.get<any>(this._url + 'users',
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            const customers = res.data.filter(r => !r.is_admin);
            resolve(customers);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }

  getCustomer(id: number) {
    return new Promise(resolve => {
      const token = this.getToken();
      this.http.get<any>(this._url + 'users',
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            const customers = res.data.filter(r => !r.is_admin && r.id === id);
            resolve(customers);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            // route guard handles the redirection
            this.backToLogin();
          }
        }
      );
    });
  }


  // Orders
  getAllOrders() {
    return new Promise(resolve => {
      const token = this.getToken();
      this.http.get<any>(this._url + 'orders-all',
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            resolve(res.data);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            this.backToLogin();
          }
        }
      );
    });
  }

  getUserOrders(userId: number | string) {
    return new Promise(resolve => {
      const token = this.getToken();
      this.http.get<any>(this._url + 'users/' + userId + '/orders',
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      })
      .subscribe(
        res => {
          console.log(res);
          if (res.status === 'success') {
            resolve(res.data);
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          if (err.status === 401) {
            this.removeToken();
            this.backToLogin();
          }
        }
      );
    });
  }
}

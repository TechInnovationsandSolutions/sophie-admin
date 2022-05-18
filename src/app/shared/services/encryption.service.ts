import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})

export class CrispyService {
  encryptyCrypto(tobEncrypt: any, grantor: any) {
    const encrypted = CryptoJS.AES.encrypt(tobEncrypt, grantor).toString();
    return encrypted;
  }

  decryptyCrypto(tobeDecrypt: any, grantor: any) {
    const decrypted = CryptoJS.AES.decrypt(tobeDecrypt, grantor);
    const decp =  decrypted.toString(CryptoJS.enc.Utf8);
    return decp;
  }
}

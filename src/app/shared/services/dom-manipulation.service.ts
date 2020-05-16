import { Injectable } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Injectable({
  providedIn: 'root'
})
export class DomManipulationService {
  @BlockUI() blockUI: NgBlockUI;

  constructor() { }

  initialBulkAction(max: number, action?: string) {
    action = action ? action + ' ' : '';
    if (max > 0) {
      this.blockUI.start('Processing');
      const blockElemDiv = document.querySelector('.block-ui-spinner .message');

      console.log('blockElemDiv', blockElemDiv);
      const p = document.createElement('p');
      p.classList.add('messager');
      p.innerHTML = action + '<span class = "min">0</span> of <span class = "max">' + max + '</span>';
      blockElemDiv.append(p);
    }
  }

  updateBulkActionValue(currentValue: number) {
    if (currentValue >= 0) {
      document.querySelector('.block-ui-spinner .message .min').innerHTML = currentValue.toString();
    }
  }

  terminateBulkAction() {
    document.querySelector('.block-ui-spinner .message p.messager').remove();
    this.blockUI.stop();
  }
}

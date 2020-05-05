import { Injectable } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Injectable({
  providedIn: 'root'
})
export class DomManipulationService {
  @BlockUI() blockUI: NgBlockUI;

  constructor() { }

  initialBulkAction(max: number) {
    if (max > 0) {
      this.blockUI.start();
      const blockElemDiv = document.querySelector('.block-ui-spinner .message');

      const p = document.createElement('p');
      p.innerHTML = 'Processing <span class = "min">0</span> of <span class = "max">' + max + '</span>';
      blockElemDiv.append(p);
    }
  }

  updateBulkActionValue(currentValue: number) {
    if (currentValue >= 0) {
      document.querySelector('.block-ui-spinner .message .min').innerHTML = currentValue.toString();
    }
  }

  terminateBulkAction() {
    this.blockUI.stop();
  }
}

import { Component, Input} from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-view-details',
  templateUrl: './map-details.component.html',
  styleUrls: ['./map-details.component.scss']
})

export class MapDetailsComponent {
  @Input() modalData: any[] = [];
  @Input() mapType: string = "";

  constructor(public activeModal: NgbActiveModal, private router: Router) { }

  onSearchExpensesThematic() {

    if (this.mapType == "municipality")
      this.router.navigate(['/expenses-municipality-label', this.modalData[0].label, "expenses-per-thematic-tab"]);
    else
      this.router.navigate(['/expenses-region-label', this.modalData[0].label, "expenses-per-thematic-tab"]);
    
    this.activeModal.close();
  }

  onSearchExpensesKae() {

    if (this.mapType == "municipality")
      this.router.navigate(['/expenses-municipality-label', this.modalData[0].label, "expenses-per-kae-tab"]);
    else
      this.router.navigate(['/expenses-region-label', this.modalData[0].label, "expenses-per-kae-tab"]);
    
    this.activeModal.close();
  }
  
  
}

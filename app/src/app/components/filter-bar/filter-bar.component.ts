import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})

export class FilterBarComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<{ municipality: string, thematic_category: string, populationOrder: string }>();

  municipalities: any[];
  thematic_categories: any[];
  selectedMunicipality: string;
  selectedThematicCategory: string;
  selectedPopulation: string;

  constructor(private apiService: ApiService) {
    this.municipalities = [];
    this.thematic_categories = [];
    this.selectedMunicipality = "";
    this.selectedThematicCategory = "";
    this.selectedPopulation = "";
  }

  // On component initialization
  ngOnInit(): void {
    this.apiService.getMunicipalities().subscribe({ next: (data) => { this.municipalities = data; }, error: (error) => { console.log(error); } });
    this.apiService.getThematicCategories().subscribe({ next: (data) => { this.thematic_categories = data; }, error: (error) => { console.log(error); } });
  }

  onFiltersChanged() {
    this.filtersChanged.emit({ municipality: this.selectedMunicipality, thematic_category: this.selectedThematicCategory, populationOrder: this.selectedPopulation });
  }
}
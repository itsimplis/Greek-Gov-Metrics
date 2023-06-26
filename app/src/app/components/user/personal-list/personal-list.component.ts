import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChartMouseLeaveEvent, ChartMouseOverEvent, ChartSelectionChangedEvent, ChartType } from 'angular-google-charts';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';
import { SharedService } from 'src/app/service/shared.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-personal-list',
  templateUrl: './personal-list.component.html',
  styleUrls: ['./personal-list.component.scss']
})

export class PersonalListComponent implements OnInit {

  // class variables
  personalList: any[];
  personalListFiltered: any[];
  currentPage: number;
  itemsPerPage: number;
  columns: Columns;
  filters: Filters;
  searchText: string = "";


  constructor(private router: Router, private apiService: ApiService, private sharedService: SharedService, private route: ActivatedRoute, private authService: AuthService) {
    this.personalList = [];
    this.personalListFiltered = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;

    this.columns = {
      ada: { key: 'ada', header: 'Αριθμός Ανάρτησης', visible: true },
      organization: { key: 'organization', header: 'Δήμος', visible: true },
      region: { key: 'region', header: 'Περιφέρεια', visible: true },
      thematic_category: { key: 'thematic_category', header: 'Θεματική Κατηγορία', visible: true },
      kae: { key: 'kae', header: 'Καε', visible: true },
      subject: { key: 'subject', header: 'Θέμα', visible: true },
      publish_date: { key: 'publish_date', header: 'Ημερ/νία', visible: true },
      pdf_url: { key: 'pdf_url', header: 'Έγγραφο', visible: true },
      signer: { key: 'signer', header: 'Υπογραφών', visible: true },
      amount: { key: 'amount', header: 'Έξοδα', visible: true },
      suspicious: { key: 'suspicious', header: 'Αξιοπιστία', visible: true }
    }

    this.filters = {
      emptyAmount: { key: 'amount', header: 'Εξαίρεση μηδενικών εξόδων', enabled: false },
      emptyPdf: { key: 'pdf_url', header: 'Εξαίρεση κενών εγγράφων', enabled: false },
      suspiciousActs: { key: 'suspicious', header: 'Εξαίρεση αμφισβητήσιμων δεδομένων', enabled: false }
    }

    this.sharedService.onNoteSaveCompleted.subscribe(result => {
      if (result.result == "success")
        this.showSuccessAlert(result.message);
      else
        this.showErrorAlert(result.message);
    });

  }

  ngOnInit(): void {
    this.loadPersonalList(this.authService.getUserName()!);
  }

  getUsername(): string | null {
    return this.authService.getUserName();
  }

  getDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  // Call to the API to get personal list with the decisions
  private loadPersonalList(username: string): void {
    this.sharedService.startRequest();
    this.personalList = [];

    this.apiService.getPersonalListOfDecisions(username).subscribe({
      next: (data) => {
        this.resetFilters();
        this.currentPage = 1;
        this.personalList = data;
        this.personalListFiltered = [...data];
        this.sharedService.endRequest();
        this.scrollToTable("municipality-thematic-table")
      },
      error: (error) => {
        console.log(error);
        this.sharedService.endRequest();
      }
    });
  }


  // Export data to an Excel (.xls) file
  exportTableToExcel(table_id: string, arg1: string, arg2: string, fullTable: boolean): void {
    var dataSource: any = [];
    var tableData: any[][] = [];

    // For Full Table (Dynamic headers & data columns)
    if (fullTable) {
      const keys = Object.keys(this.columns).filter(key => this.columns[key as keyof Columns].visible);
      const headers = keys.map(key => this.columns[key as keyof Columns].header);
      dataSource.push(headers);
      dataSource.push(...this.personalListFiltered.map(item => {
        return keys.map(key => {
          if (key === 'suspicious') {
            return item[key as keyof typeof item] === 1 ? 'Οχι' : 'Ναι';
          } else {
            return item[key as keyof typeof item];
          }
        });
      }));
      tableData = [...tableData, ...dataSource];
    }

    // For Current Page (Dynamic headers & data columns)
    else {
      const keys = Object.keys(this.columns).filter(
        (key) => this.columns[key as keyof Columns].visible
      );
      const headers = keys.map((key) => this.columns[key as keyof Columns].header);
      tableData.push(headers);

      const currentPageData = this.personalListFiltered.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );

      tableData.push(
        ...currentPageData.map((item) => {
          return keys.map(key => {
            if (key === 'suspicious') {
              return item[key as keyof typeof item] === 1 ? 'Οχι' : 'Ναι';
            } else {
              return item[key as keyof typeof item];
            }
          });
        })
      );
    }

    const filename = "Προσωπική Λίστα (" + arg1 + " - " + arg2 + ")";
    const sheetName = filename.length > 31 ? filename.substring(0, 31) : filename;
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(tableData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename + '.xlsx');

    this.showSuccessAlert("Το κατέβασμα του αρχείου ξεκίνησε !")
  }

  // Sort the table based on column key
  sortTable(columnKey: string,) {
    let arrayToSort: any;
    let columns: Columns;
    arrayToSort = this.personalListFiltered;
    columns = this.columns;
    const column = Object.values(columns!).find(col => col.key === columnKey);

    if (!column) {
      return;
    }

    arrayToSort.sort((a: any, b: any) => {
      let valA = a[column.key];
      let valB = b[column.key];
  
      if (column.key === 'publish_date') {
        valA = valA.split('-').reverse().join('-');
        valB = valB.split('-').reverse().join('-');
        valA = new Date(valA);
        valB = new Date(valB);
      }
  
      if (valA < valB) {
        return column.sortOrder === 'asc' ? -1 : 1;
      } else if (valA > valB) {
        return column.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Switch sorting direction for the next click on this column
    column.sortOrder = column.sortOrder === 'asc' ? 'desc' : 'asc';
  }

  // Scroll to table with a small delay
  private scrollToTable(id: string) {
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth', block: 'nearest',
          inline: 'center'
        })
      }
    }, 50);
  }

  // Sorting with JQuery


  // Delegate to sharedService to get decision data from the API and open the decision modal
  onViewDetailsButtonClick(selectedAda: string) {
    this.sharedService.openDetailsModal(selectedAda);
  }

  // Delegate to sharedService to get note data from the API and open the note modal
  onViewNoteButtonClick(username: string, ada: string) {
    this.sharedService.openNoteModal(username, ada);
  }

  // Search input events & Filtering

  onSearchInputChange(event: any) {
    this.searchText = (<HTMLInputElement>event.target).value.toLocaleLowerCase()
    this.applyFilters();
  }

  onCheckboxChange() {
    this.applyFilters();
  }

   // Loading Spinners
   isLoading(): boolean {
    return this.sharedService.isLoading();
  }

  // Apply filters
  applyFilters() {
    this.personalListFiltered = this.personalList.filter(item => {

      for (let filter of Object.values(this.filters)) {
        if (filter == this.filters.suspiciousActs) {
          if (filter.enabled && item.suspicious == 1) {
            return false;
          }
        } else {
          if (filter.enabled && !item[filter.key]) {
            return false;
          }
        }
      }

      if (!this.searchText) {
        return true;
      }

      return Object.values(item).some(val =>
        (typeof val === 'string' && val.toLocaleLowerCase().includes(this.searchText)) ||
        (typeof val === 'number' && val.toString().includes(this.searchText))
      );
    });
  }

  // Reset appropriate filters
  resetFilters() {
    this.filters.emptyAmount.enabled = false;
    this.filters.emptyPdf.enabled = false;
    this.filters.suspiciousActs.enabled = false;
  }

  // Show the success alert
  showSuccessAlert(text: string): void {

    const alertSuccess = document.getElementById("main-alert");
    if (alertSuccess) {
      alertSuccess.innerHTML = `<strong>${text}</strong>`
      alertSuccess.className = "alert custom-alert rounded alert-success";
      alertSuccess.style.display = 'block';
    }
    setTimeout(() => {
      document.getElementById("main-alert")!.style.display = 'none';
    }, 3500);
  }

  // Show the success alert
  showErrorAlert(text: string): void {

    const alertError = document.getElementById("main-alert");
    if (alertError) {
      alertError.innerHTML = `<strong>${text}</strong>`
      alertError.className = "alert custom-alert rounded alert-danger";
      alertError.style.display = 'block';
    }
    setTimeout(() => {
      document.getElementById("main-alert")!.style.display = 'none';
    }, 3500);
  }

  // Pagination events

  onTablePageChanged(event: any) {
    this.currentPage = event;
  }

  // List decision removal

  onRemoveFromPersonalList(username: string, ada: string) {
    this.apiService.removeDecisionFromPersonalList(username, ada).subscribe({
      next: (data) => {
        this.personalListFiltered = this.personalListFiltered.filter(item => item.ada !== ada);
        this.showSuccessAlert(data.message);
      },
      error: (error) => {
        this.showErrorAlert(error.error.detail);
        console.log(error);
      }
    }

    )
  }

}

interface Column {
  key: string,
  header: string,
  visible: boolean,
  sortOrder?: 'asc' | 'desc' | '';
}

interface Filter {
  key: string,
  header: string,
  enabled: boolean
}

interface Filters {
  [key: string]: Filter;
}

interface Columns {
  ada: Column,
  organization: Column,
  region: Column,
  thematic_category: Column,
  kae: Column,
  subject: Column,
  pdf_url: Column,
  signer: Column,
  publish_date: Column,
  amount: Column,
  suspicious: Column
}

interface Filters {
  emptyAmount: Filter,
  emptyPdf: Filter,
  suspiciousActs: Filter
}

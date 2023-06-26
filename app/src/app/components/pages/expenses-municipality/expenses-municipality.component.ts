import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChartMouseLeaveEvent, ChartMouseOverEvent, ChartSelectionChangedEvent, ChartType } from 'angular-google-charts';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';
import { SharedService } from 'src/app/service/shared.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-expenses-municipality',
  templateUrl: './expenses-municipality.component.html',
  styleUrls: ['./expenses-municipality.component.scss'],
})

export class ExpensesMunicipalityComponent implements OnInit {

  // class variables
  chart: any;
  kaes: any[];
  municipalities: any[];
  thematicCategories: any[];
  expensesAllVsRegion: any[];
  expensesAllThematic: any[];
  expensesAllThematicYearly: any[];
  expensesPerThematic: any[];
  expensesPerThematicFiltered: any[];
  expensesAllKae: any[];
  expensesAllKaeYearly: any[];
  expensesPerKae: any[];
  expensesPerKaeFiltered: any[];
  selectedMunicipalityDate: string = '';
  selectedMunicipalityThematic: string = '';
  selectedMunicipalityThematicLabel: string = '';
  selectedMunicipalityKae: string = '';
  selectedMunicipalityKaeLabel: string = '';
  selectedThematic: string = '';
  selectedThematicLabel: string = '';
  selectedKae: string = '';
  selectedKaeLabel: string = '';
  selectedDate: string = '';
  pieChartDataThematic: any[];
  pieChartDataKae: any[];
  lineChartDataThematic: any[];
  lineChartDataKae: any[];

  lineChartType: ChartType = ChartType.LineChart;
  pieChartType: ChartType = ChartType.PieChart;

  currentPageThematic: number;
  itemsPerPageThematic: number;
  currentPageKae: number;
  itemsPerPageKae: number;
  columnsThematic: ColumnsThematic;
  columnsKae: ColumnsKae;
  filtersThematic: FiltersThematic;
  filtersKae: FiltersKae;
  searchTextThematic: string = '';
  searchTextKae: string = '';
  reverseSortThematic = {};
  reverseSortKae = {};
  output: Output = { result: '', message: '' };

  constructor(
    private router: Router,
    private apiService: ApiService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.kaes = [];
    this.municipalities = [];
    this.thematicCategories = [];
    this.expensesAllVsRegion = [];
    this.expensesAllThematic = [];
    this.expensesAllThematicYearly = [];
    this.expensesPerThematicFiltered = [];
    this.expensesPerThematic = [];
    this.expensesAllKae = [];
    this.expensesAllKaeYearly = [];
    this.expensesPerKaeFiltered = [];
    this.expensesPerKae = [];
    this.pieChartDataThematic = [];
    this.lineChartDataThematic = [];
    this.lineChartDataKae = [];
    this.pieChartDataKae = [];
    this.currentPageThematic = 1;
    this.itemsPerPageThematic = 10;
    this.currentPageKae = 1;
    this.itemsPerPageKae = 10;

    this.columnsThematic = {
      ada: { key: 'ada', header: 'Αριθμός Ανάρτησης', visible: true },
      organization: { key: 'organization', header: 'Δήμος', visible: true },
      thematic_category: { key: 'thematic_category', header: 'Θεματική Κατηγορία', visible: true },
      subject: { key: 'subject', header: 'Θέμα', visible: true },
      publish_date: { key: 'publish_date', header: 'Ημερ/νία', visible: true },
      pdf_url: { key: 'pdf_url', header: 'Έγγραφο', visible: true },
      signer: { key: 'signer', header: 'Υπογραφών', visible: true },
      amount: { key: 'amount', header: 'Έξοδα', visible: true },
      suspicious: { key: 'suspicious', header: 'Αξιοπιστία', visible: true }
    };

    this.columnsKae = {
      ada: { key: 'ada', header: 'Αριθμός Ανάρτησης', visible: true },
      organization: { key: 'organization', header: 'Δήμος', visible: true },
      kae: { key: 'kae', header: 'Καε', visible: true },
      publish_date: { key: 'publish_date', header: 'Ημερ/νία', visible: true },
      subject: { key: 'subject', header: 'Θέμα', visible: true },
      pdf_url: { key: 'pdf_url', header: 'Έγγραφο', visible: true },
      signer: { key: 'signer', header: 'Υπογραφών', visible: true },
      amount: { key: 'amount', header: 'Έξοδα', visible: true },
      suspicious: { key: 'suspicious', header: 'Αξιοπιστία', visible: true }
    };

    this.filtersThematic = {
      emptyAmount: { key: 'amount', header: 'Εξαίρεση μηδενικών εξόδων', enabled: false },
      emptyPdf: { key: 'pdf_url', header: 'Εξαίρεση κενών εγγράφων', enabled: false },
      suspiciousActs: { key: 'suspicious', header: 'Εξαίρεση αμφισβητήσιμων δεδομένων', enabled: false }
    };

    this.filtersKae = {
      emptyAmount: { key: 'amount', header: 'Εξαίρεση μηδενικών εξόδων', enabled: false },
      emptyPdf: { key: 'pdf_url', header: 'Εξαίρεση κενών εγγράφων', enabled: false },
      suspiciousActs: { key: 'suspicious', header: 'Εξαίρεση αμφισβητήσιμων δεδομένων', enabled: false }
    };
  }

  ngOnInit(): void {
    this.sharedService.expensesPage = 'Δήμων';

    this.apiService.getMunicipalitiesOfDecisions().subscribe({
      next: (data) => {
        this.municipalities = data;

        this.route.paramMap.subscribe((params) => {
          let municipalityIdentifier: string | null;

          const municipalityUid = params.get('municipalityUid');
          if (municipalityUid) {
            municipalityIdentifier = municipalityUid;
          } else {
            const municipalityLabel = params.get('municipalityLabel');
            if (municipalityLabel) {
              municipalityIdentifier = this.municipalities.find(
                (item) => item.label === municipalityLabel
              ).uid;
            }
          }

          const activeTabId = params.get('activeTabId');

          const tabButton = document.getElementById(activeTabId!);
          if (tabButton) {
            tabButton.click();
            if (activeTabId == 'expenses-per-thematic-tab') {
              this.selectedMunicipalityThematic = municipalityIdentifier!;
              this.onMunicipalityThematicChanged(
                this.selectedMunicipalityThematic
              );
            } else {
              this.selectedMunicipalityKae = municipalityIdentifier!;
              this.onMunicipalityKaeChanged(this.selectedMunicipalityKae);
            }
          }
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // Pie Chart Configuration
  pieChartOptionsThematic = {
    title: 'Έξοδα ανά θεματική κατηγορία  (δεδομένα απο το 2019)',
    width: 1000,
    height: 600,
    sliceVisibilityThreshold: 0,
  };

  pieChartOptionsKae = {
    title: 'Έξοδα ανά KAE  (δεδομένα απο το 2019)',
    width: 1000,
    height: 600,
    sliceVisibilityThreshold: 0,
  };

  // Column Chart Configuration
  lineChartOptionsThematic = {
    // title: 'Expenses by Year',
    width: 1000,
    height: 600,
    hAxis: {
      title: 'Έτος',
      format: '####' // set the format of the hAxis labels to 4 digits (e.g. 2022 instead of 22)
    },
    vAxis: {
      title: 'Έξοδα',
      format: '€#,###', // set the format of the vAxis labels to Euros
    },
    colors: ['#3366CC'] // set the color of the line to a shade of blue
  };

  // Line Chart Configuration
  lineChartOptionsKae = {
    // title: 'Expenses by Year',
    width: 1000,
    height: 600,
    hAxis: {
      title: 'Έτος',
      format: '####' // set the format of the hAxis labels to 4 digits (e.g. 2022 instead of 22)
    },
    vAxis: {
      title: 'Έξοδα',
      format: '€#,###', // set the format of the vAxis labels to Euros
    },
    colors: ['#3366CC'] // set the color of the line to a shade of blue
  };

  // Call to the API to get the thematic categories that exist in decisions for the selected municipality
  private loadThematicCategoriesPerMunicipality(selMun: string): void {
    this.thematicCategories = [];

    this.apiService.getThematicCategoriesPerMunicipality(selMun).subscribe({
      next: (data) => {
        this.thematicCategories = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // Call to the API to get the kaes that exist in decisions for the selected municipality
  private loadKaesPerMunicipality(selMun: string): void {
    this.kaes = [];

    this.apiService.getKaesPerMunicipality(selMun).subscribe({
      next: (data) => {
        this.kaes = data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // Call to the API to get the expenses per municipality per thematic category
  private loadExpensesPerMunicipalityPerThematic(selMun: string, selThem: string): void {
    this.sharedService.startRequest();
    this.expensesPerThematic = [];

    this.apiService.getMunicipalityExpensesPerThematic(selMun, selThem).subscribe({
      next: (data) => {
        this.resetFilters('thematic');
        this.currentPageThematic = 1;
        this.expensesPerThematic = data;
        this.expensesPerThematicFiltered = [...data];
        this.sharedService.endRequest();
        this.scrollToTable('municipality-thematic-table');
      },
      error: (error) => {
        console.log(error);
        this.sharedService.endRequest();
      },
    });
  }

  // Call to the API to get the sum of expenses for each Thematic category, per municipality
  private loadExpensesPerMunicipalityAllThematic(selMun: string): void {
    this.sharedService.startRequest();
    this.expensesAllThematic = [];

    this.apiService.getMunicipalityExpensesAllThematic(selMun).subscribe({
      next: (data) => {
        this.expensesAllThematic = data;
        this.pieChartDataThematic = this.expensesAllThematic.map((item) => [
          item.thematic_category,
          item.sum_amount || 0,
          item.thematic_category_uid,
        ]);
        this.sharedService.endRequest();
      },
      error: (error) => {
        console.log(error);
        this.sharedService.endRequest();
      },
    });
  }

  // Call to the API to get the Thematic expenses per Year per Region
  private loadMunicipalityThematicExpensesPerYear(selMun: string): void {
    this.sharedService.startRequest();
    this.expensesAllThematicYearly = [];

    this.apiService.getMunicipalityThematicExpensesPerYear(selMun).subscribe({
      next: (data) => {
        this.expensesAllThematicYearly = data;
        this.lineChartDataThematic = this.expensesAllThematicYearly.map((item) => [
          item.year,
          item.total_expenses,
        ]);
        this.sharedService.endRequest();
      },
      error: (error) => {
        console.log(error);
        this.sharedService.endRequest();
      },
    });
  }

  // Call to the API to get the Kae expenses per Year per Region
  private loadMunicipalityKaeExpensesPerYear(selMun: string): void {
    this.sharedService.startRequest();
    this.expensesAllKaeYearly = [];

    this.apiService.getMunicipalityKaeExpensesPerYear(selMun).subscribe({
      next: (data) => {
        this.expensesAllKaeYearly = data;
        this.lineChartDataKae = this.expensesAllKaeYearly.map((item) => [
          item.year,
          item.total_expenses,
        ]);
        this.sharedService.endRequest();
      },
      error: (error) => {
        console.log(error);
        this.sharedService.endRequest();
      },
    });
  }

  // Call to the API to get the expenses per municipality per kae
  private loadExpensesPerMunicipalityPerKae(selMun: string, selKae: string): void {
    this.sharedService.startRequest();
    this.expensesPerKae = [];

    this.apiService.getMunicipalityExpensesPerKae(selMun, selKae).subscribe({
      next: (data) => {
        this.resetFilters('kae');
        this.currentPageKae = 1;
        this.expensesPerKae = data;
        this.expensesPerKaeFiltered = [...data];
        this.sharedService.endRequest();
        this.scrollToTable('municipality-kae-table');
      },
      error: (error) => {
        console.log(error);
        this.sharedService.endRequest();
      },
    });
  }

  // Call to the API to get the sum of expenses for each Kae, per municipality
  private loadExpensesPerMunicipalityAllKae(selMun: string): void {
    this.sharedService.startRequest();
    this.expensesAllKae = [];

    this.apiService.getMunicipalityExpensesAllKae(selMun).subscribe({
      next: (data) => {
        this.expensesAllKae = data;
        this.pieChartDataKae = this.expensesAllKae.map((item) => [
          item.kae,
          item.sum_amount || 0,
          item.kae_uid,
        ]);
        this.sharedService.endRequest();
      },
      error: (error) => {
        console.log(error);
        this.sharedService.endRequest();
      },
    });
  }

  // Export data to an Excel (.xls) file
  exportTableToExcel(
    table_id: string,
    arg1: string,
    arg2: string,
    fullTable: boolean
  ): void {
    var dataSource: any = [];
    var tableData: any[][] = [];

    // For Full Table (Dynamic headers & data columns)
    if (fullTable) {
      if (table_id == 'municipality-thematic-table') {
        const keys = Object.keys(this.columnsThematic).filter(
          (key) => this.columnsThematic[key as keyof ColumnsThematic].visible
        );
        const headers = keys.map(
          (key) => this.columnsThematic[key as keyof ColumnsThematic].header
        );
        dataSource.push(headers);
        dataSource.push(
          ...this.expensesPerThematicFiltered.map((item) => {
            return keys.map((key) => {
              if (key === 'suspicious') {
                return item[key as keyof typeof item] === 1 ? 'Οχι' : 'Ναι';
              } else {
                return item[key as keyof typeof item];
              }
            });
          })
        );
      } else {
        const keys = Object.keys(this.columnsKae).filter(
          (key) => this.columnsKae[key as keyof ColumnsKae].visible
        );
        const headers = keys.map(
          (key) => this.columnsKae[key as keyof ColumnsKae].header
        );
        dataSource.push(headers);
        dataSource.push(
          ...this.expensesPerKaeFiltered.map((item) => {
            return keys.map((key) => {
              if (key === 'suspicious') {
                return item[key as keyof typeof item] === 1 ? 'Οχι' : 'Ναι';
              } else {
                return item[key as keyof typeof item];
              }
            });
          })
        );
      }

      tableData = [...tableData, ...dataSource];
    }

    // For Current Page (Dynamic headers & data columns)
    else {
      if (table_id === 'municipality-thematic-table') {
        const keys = Object.keys(this.columnsThematic).filter(
          (key) => this.columnsThematic[key as keyof ColumnsThematic].visible
        );
        const headers = keys.map(
          (key) => this.columnsThematic[key as keyof ColumnsThematic].header
        );
        tableData.push(headers);

        const currentPageData = this.expensesPerThematicFiltered.slice(
          (this.currentPageThematic - 1) * this.itemsPerPageThematic,
          this.currentPageThematic * this.itemsPerPageThematic
        );

        tableData.push(
          ...currentPageData.map((item) => {
            return keys.map((key) => {
              if (key === 'suspicious') {
                return item[key as keyof typeof item] === 1 ? 'Οχι' : 'Ναι';
              } else {
                return item[key as keyof typeof item];
              }
            });
          })
        );
      } else {
        const keys = Object.keys(this.columnsKae).filter(
          (key) => this.columnsKae[key as keyof ColumnsKae].visible
        );
        const headers = keys.map(
          (key) => this.columnsKae[key as keyof ColumnsKae].header
        );
        tableData.push(headers);

        const currentPageData = this.expensesPerKaeFiltered.slice(
          (this.currentPageKae - 1) * this.itemsPerPageKae,
          this.currentPageKae * this.itemsPerPageKae
        );

        tableData.push(
          ...currentPageData.map((item) => {
            return keys.map((key) => {
              if (key === 'suspicious') {
                return item[key as keyof typeof item] === 1 ? 'Οχι' : 'Ναι';
              } else {
                return item[key as keyof typeof item];
              }
            });
          })
        );
      }
    }

    const filename = 'Έξοδα (' + arg1 + ' - ' + arg2 + ')';
    const sheetName =
      filename.length > 31 ? filename.substring(0, 31) : filename;
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(tableData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename + '.xlsx');

    this.showSuccessAlert('Το κατέβασμα του αρχείου ξεκίνησε !');
  }

  // Sort the table based on column key
  sortTable(table: 'kae' | 'thematic', columnKey: string) {

    let arrayToSort: any;
    let columns: ColumnsKae | ColumnsThematic;



    if (table === 'kae') {
      arrayToSort = this.expensesPerKaeFiltered;
      columns = this.columnsKae;
    } else if (table === 'thematic') {
      arrayToSort = this.expensesPerThematicFiltered;
      columns = this.columnsThematic;
    }

    const column = Object.values(columns!).find((col) => col.key === columnKey);

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

  formatDate(date: Date): string {
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  // Call to the API to get the expenses per municipality per date
  private loadExpensesPerMunicipalityPerDate(
    selMun: string,
    selDate: string
  ): void {
    // TODO: ...
  }

  // Scroll to table with a small delay
  private scrollToTable(id: string) {
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }, 50);
  }

  // Sorting with JQuery

  // Delegate to sharedService to get data from the API and open the modal
  onViewDetailsButtonClick(selectedAda: string) {
    this.sharedService.openDetailsModal(selectedAda);
  }

  // Dropdown events

  onMunicipalityThematicChanged(event: any) {
    this.selectedThematic = '';
    this.expensesPerThematic = [];

    if (this.selectedMunicipalityThematic != '') {
      this.loadThematicCategoriesPerMunicipality(this.selectedMunicipalityThematic);
      this.loadExpensesPerMunicipalityAllThematic(this.selectedMunicipalityThematic);
      this.loadMunicipalityThematicExpensesPerYear(this.selectedMunicipalityThematic);
      this.selectedMunicipalityThematicLabel = this.municipalities.find((item) => item.uid === event).label;
    } else {
      this.selectedMunicipalityThematicLabel = '';
      this.pieChartDataThematic = [];
      this.lineChartDataThematic = [];
    }
  }

  onMunicipalityKaeChanged(event: any) {
    this.selectedKae = '';
    this.expensesPerKae = [];

    if (this.selectedMunicipalityKae != '') {
      this.loadExpensesPerMunicipalityAllKae(this.selectedMunicipalityKae);
      this.loadKaesPerMunicipality(this.selectedMunicipalityKae);
      this.loadMunicipalityKaeExpensesPerYear(this.selectedMunicipalityKae);
      this.selectedMunicipalityKaeLabel = this.municipalities.find((item) => item.uid === event).label;
    } else {
      this.selectedMunicipalityKaeLabel = '';
      this.pieChartDataKae = [];
      this.lineChartDataKae = [];
    }
  }

  onThematicChanged(event: any) {
    if (this.selectedThematic != '') {
      this.loadExpensesPerMunicipalityPerThematic(this.selectedMunicipalityThematic, this.selectedThematic);
      this.selectedThematicLabel = this.thematicCategories.find((item) => item.uid === event).label;
    } else {
      this.expensesPerThematic = [];
    }
  }

  onKaeChanged(event: any) {
    if (this.selectedKae != '') {
      this.loadExpensesPerMunicipalityPerKae(this.selectedMunicipalityKae, this.selectedKae);
      this.selectedKaeLabel = this.kaes.find((item) => item.uid === event).label;
    } else {
      this.expensesPerKae = [];
    }
  }

  // Charts events

  onPieChartThematicSelect(event: ChartSelectionChangedEvent) {
    if (event.selection.length > 0) {
      const selectedItem = event.selection[0];
      const selectedValue = this.pieChartDataThematic[selectedItem.row!][2];
      this.selectedThematic = selectedValue;
      this.selectedThematicLabel = this.thematicCategories.find((item) => item.uid === selectedValue).label;
      this.loadExpensesPerMunicipalityPerThematic(this.selectedMunicipalityThematic, this.selectedThematic);
    }
  }

  onPieChartKaeSelect(event: ChartSelectionChangedEvent) {
    if (event.selection.length > 0) {
      const selectedItem = event.selection[0];
      const selectedValue = this.pieChartDataKae[selectedItem.row!][2];
      this.selectedKae = selectedValue;
      this.selectedKaeLabel = this.kaes.find((item) => item.uid === selectedValue).label;
      this.loadExpensesPerMunicipalityPerKae(this.selectedMunicipalityKae, this.selectedKae);
    }
  }

  onPieChartThematicMouseOver(event: ChartMouseOverEvent) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-thematic svg'
    );
    if (chartElement) {
      chartElement.style.cursor = 'pointer';
    }
  }

  onPieChartKaeMouseOver(event: ChartMouseOverEvent) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-kae svg'
    );
    if (chartElement) {
      chartElement.style.cursor = 'pointer';
    }
  }

  onPieChartThematicMouseLeave(event: ChartMouseLeaveEvent) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-thematic svg'
    );
    if (chartElement) {
      chartElement.style.cursor = '';
    }
  }

  onPieChartKaeMouseLeave(event: ChartMouseLeaveEvent) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-kae svg'
    );
    if (chartElement) {
      chartElement.style.cursor = '';
    }
  }

  // Search input events & Filtering

  onThematicSearchInputChange(event: any) {
    this.searchTextThematic = (<HTMLInputElement>(event.target)).value.toLocaleLowerCase();
    this.applyFiltersThematic();
  }

  onKaeSearchInputChange(event: any) {
    this.searchTextKae = (<HTMLInputElement>(event.target)).value.toLocaleLowerCase();
    this.applyFiltersKae();
  }

  onThematicCheckboxChange() {
    this.applyFiltersThematic();
  }

  onKaeCheckboxChange() {
    this.applyFiltersKae();
  }

  // Apply filters for Thematic
  applyFiltersThematic() {
    this.expensesPerThematicFiltered = this.expensesPerThematic.filter(
      (item) => {
        for (let filter of Object.values(this.filtersThematic)) {
          if (filter == this.filtersThematic.suspiciousActs) {
            if (filter.enabled && item.suspicious == 1) {
              return false;
            }
          } else {
            if (filter.enabled && !item[filter.key]) {
              return false;
            }
          }
        }

        if (!this.searchTextThematic) {
          return true;
        }

        return Object.values(item).some((val) =>
          (typeof val === 'string' && val.toLocaleLowerCase().includes(this.searchTextThematic)) ||
          (typeof val === 'number' && val.toString().includes(this.searchTextThematic))
        );
      }
    );
  }

  // Apply filters for Kae
  applyFiltersKae() {
    this.expensesPerKaeFiltered = this.expensesPerKae.filter((item) => {
      for (let filter of Object.values(this.filtersKae)) {
        if (filter == this.filtersKae.suspiciousActs) {
          if (filter.enabled && item.suspicious == 1) {
            return false;
          }
        } else {
          if (filter.enabled && !item[filter.key]) {
            return false;
          }
        }
      }

      if (!this.searchTextKae) {
        return true;
      }

      return Object.values(item).some(val =>
        (typeof val === 'string' && val.toLocaleLowerCase().includes(this.searchTextKae)) ||
        (typeof val === 'number' && val.toString().includes(this.searchTextKae))
      );
    });
  }

  // Reset appropriate filters
  resetFilters(type: string) {
    if (type == 'thematic') {
      this.filtersThematic.emptyAmount.enabled = false;
      this.filtersThematic.emptyPdf.enabled = false;
      this.filtersThematic.suspiciousActs.enabled = false;
    } else {
      this.filtersKae.emptyAmount.enabled = false;
      this.filtersKae.emptyPdf.enabled = false;
      this.filtersKae.suspiciousActs.enabled = false;
    }
  }

  // Show the success alert
  showSuccessAlert(text: string): void {
    const alertSuccess = document.getElementById('main-alert');
    if (alertSuccess) {
      alertSuccess.innerHTML = `<strong>${text}</strong>`;
      alertSuccess.className = 'alert custom-alert rounded alert-success';
      alertSuccess.style.display = 'block';
    }
    setTimeout(() => {
      document.getElementById('main-alert')!.style.display = 'none';
    }, 3500);
  }

  // Show the success alert
  showErrorAlert(text: string): void {
    const alertError = document.getElementById('main-alert');
    if (alertError) {
      alertError.innerHTML = `<strong>${text}</strong>`;
      alertError.className = 'alert custom-alert rounded alert-danger';
      alertError.style.display = 'block';
    }
    setTimeout(() => {
      document.getElementById('main-alert')!.style.display = 'none';
    }, 3500);
  }

  // Pagination events

  onThematicTablePageChanged(event: any) {
    this.currentPageThematic = event;
  }

  onKaeTablePageChanged(event: any) {
    this.currentPageKae = event;
  }

  // Loading Spinners

  isLoading(): boolean {
    return this.sharedService.isLoading();
  }

  // Authenticated-only functionality

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  onAddToPersonalList(ada: string) {
    this.apiService
      .addDecisionToPersonalList(this.authService.getUserName()!, ada)
      .subscribe({
        next: (data) => {
          this.output.result = 'success';
          this.output.message = data.message;
          this.showSuccessAlert(this.output.message);
        },
        error: (error) => {
          console.log(error);
          this.output.result = 'error';
          this.output.message = error.error.detail;
          this.showErrorAlert(this.output.message);
        },
      });
  }
}

interface Column {
  key: string;
  header: string;
  visible: boolean;
  sortOrder?: 'asc' | 'desc' | '';
}

interface Filter {
  key: string;
  header: string;
  enabled: boolean;
}

interface ColumnsThematic {
  ada: Column;
  organization: Column;
  thematic_category: Column;
  subject: Column;
  pdf_url: Column;
  signer: Column;
  publish_date: Column;
  amount: Column;
  suspicious: Column;
}

interface ColumnsKae {
  ada: Column;
  organization: Column;
  kae: Column;
  subject: Column;
  pdf_url: Column;
  signer: Column;
  publish_date: Column;
  amount: Column;
  suspicious: Column;
}

interface FiltersThematic {
  emptyAmount: Filter;
  emptyPdf: Filter;
  suspiciousActs: Filter;
}

interface FiltersKae {
  emptyAmount: Filter;
  emptyPdf: Filter;
  suspiciousActs: Filter;
}

interface Output {
  result: string;
  message: string;
}

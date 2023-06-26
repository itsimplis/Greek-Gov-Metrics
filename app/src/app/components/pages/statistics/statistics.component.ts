import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartType } from 'angular-google-charts';
import { ApiService } from 'src/app/service/api.service';
import { SharedService } from 'src/app/service/shared.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  pieChartRegionData: any[];
  columnChartRegionThematicData: any[];
  barChartRegionKaeData: any[];
  barChartMunicipalityKaeData: any[];

  pieChartMunicipalityData: any[];
  columnChartMunicipalityThematicData: any[];
  columnChartMunicipalityKaeData: any[];

  topRegionsOnThematic: any[];
  topRegionsOnKae: any[];
  top5RegionsDecisions: any[];
  topMunicipalitiesOnThematic: any[];
  topMunicipalitiesOnKae: any[];
  top5MunicipalitiesDecisions: any[];
  top5Signers: any[];

  decisionsUnder1Euro: any[];
  decisionsOver1MilEuro: any[];
  latestUpdate: any[];
  firstUpdate: any[];
  decisionsCurrentYear: any[];
  munMostExpenses: any[];
  regionMostExpenses: any[];
  top5Thematic: any[];
  top5Kae: any[];

  totalExpensesAllRegions: any[];
  totalExpensesAllMunicipalities: any[];

  columnChartType: ChartType = ChartType.ColumnChart;
  comboChartType: ChartType = ChartType.ComboChart;
  pieChartType: ChartType = ChartType.PieChart;
  areaChartType: ChartType = ChartType.AreaChart;
  barChartType: ChartType = ChartType.BarChart;
  histogramChartType: ChartType = ChartType.Histogram;

  // Construct
  constructor(private apiService: ApiService, private router: Router, private sharedService: SharedService) {
    this.pieChartRegionData = [];
    this.pieChartMunicipalityData = [];
    this.columnChartRegionThematicData = [];
    this.barChartRegionKaeData = [];
    this.barChartMunicipalityKaeData = [];
    this.columnChartMunicipalityThematicData = [];
    this.columnChartMunicipalityKaeData = [];

    this.topRegionsOnThematic = [];
    this.topRegionsOnKae = [];
    this.top5RegionsDecisions = [];
    this.topMunicipalitiesOnThematic = [];
    this.topMunicipalitiesOnKae = [];
    this.top5MunicipalitiesDecisions = [];
    this.top5Thematic = [];
    this.top5Kae = [];
    this.top5Signers = [];

    this.totalExpensesAllRegions = [];
    this.totalExpensesAllMunicipalities = [];

    this.decisionsUnder1Euro = [];
    this.decisionsOver1MilEuro = [];
    this.firstUpdate = [];
    this.latestUpdate = [];
    this.decisionsCurrentYear = [];
    this.munMostExpenses = [];
    this.regionMostExpenses = [];
  }

  // On initialization
  ngOnInit(): void {
    // Regions
    if (this.columnChartRegionThematicData.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getTopTenThematicExpenseRegions().subscribe({
        next: (data) => {
          this.topRegionsOnThematic = data;
          this.columnChartRegionThematicData = this.topRegionsOnThematic.map(
            (data) => [data.region, data.sum_amount, data.region_uid]
          );
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    if (this.barChartRegionKaeData.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getTopTenKaeExpenseRegions().subscribe({
        next: (data) => {
          this.topRegionsOnKae = data;
          this.barChartRegionKaeData = this.topRegionsOnKae.map((data) => [
            data.region,
            data.sum_amount,
            data.region_uid,
          ]);
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    if (this.pieChartRegionData.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getTotalExpensesAllRegions().subscribe({
        next: (data) => {
          this.totalExpensesAllRegions = data;
          this.pieChartRegionData = this.totalExpensesAllRegions.map((data) => [
            data.region,
            data.sum_amount,
            data.region_uid,
          ]);
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }
    // ==============GENERIC STATISTICS SECTION=========================
  }

  // On General Statistics Tab click
  loadGeneralStatistics() {

    // DECISIONS UNDER 1 EURO
    if (this.decisionsUnder1Euro.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getDecisionsUnder1Euro().subscribe({
        next: (data) => {
          this.decisionsUnder1Euro = data;
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    // DECISIONS OVER 1 MIL EURO
    if (this.decisionsOver1MilEuro.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getDecisionsOver1MilEuro().subscribe({
        next: (data) => {
          this.decisionsOver1MilEuro = data;
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    //LATEST UPDATE FROM DATABASE
    if (this.latestUpdate.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getLatestUpdate().subscribe({
        next: (data) => {
          this.latestUpdate = data;
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    //FIRST UPDATE FROM DATABASE
    if (this.firstUpdate.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getFirstUpdate().subscribe({
        next: (data) => {
          this.firstUpdate = data;
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    //NUMBER OF DECISIONS FOR THE Current YEAR
    if (this.decisionsCurrentYear.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getDecisionsCurrentYear().subscribe({
        next: (data) => {
          this.decisionsCurrentYear = data;
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    //Municipality with most expenses
    if (this.munMostExpenses.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getMunMostExpenses().subscribe({
        next: (data) => {
          this.munMostExpenses = data;
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    //Region with most expenses
    if (this.regionMostExpenses.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getRegMostExpenses().subscribe({
        next: (data) => {
          this.regionMostExpenses = data;
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    //TOP 5 THEMATIC
    if (this.top5Thematic.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getTop5Thematic().subscribe({
        next: (data) => {
          this.top5Thematic = data;
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    //TOP 5 KAE
    if (this.top5Kae.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getTop5Kae().subscribe({
        next: (data) => {
          this.top5Kae = data;
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    //TOP 5 Signers
    if (this.top5Signers.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getTop5Signers().subscribe({
        next: (data) => {
          this.top5Signers = data;
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }



    // top 5 mun decisions
    if (this.top5MunicipalitiesDecisions.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getMunicipalitiesTop5Decisions().subscribe({
        next: (data) => {
          this.top5MunicipalitiesDecisions = data;
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

  }

  // On Municipality Statistics Tab click
  loadMunicipalityStatistics() {

    if (this.columnChartMunicipalityThematicData.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getTopTenThematicExpenseMunicipalities().subscribe({
        next: (data) => {
          this.topMunicipalitiesOnThematic = data;
          this.columnChartMunicipalityThematicData =
            this.topMunicipalitiesOnThematic.map((data) => [
              data.municipality,
              data.sum_amount,
              data.municipality_uid,
            ]);
            this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    if (this.columnChartMunicipalityKaeData.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getTopTenKaeExpenseMunicipalities().subscribe({
        next: (data) => {
          this.topMunicipalitiesOnKae = data;
          this.columnChartMunicipalityKaeData = this.topMunicipalitiesOnKae.map(
            (data) => [
              data.municipality,
              data.sum_amount,
              data.municipality_uid,
            ]
          );
          this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }

    if (this.pieChartMunicipalityData.length == 0) {
      this.sharedService.startRequest();
      this.apiService.getTotalExpensesAllMunicipalities().subscribe({
        next: (data) => {
          this.totalExpensesAllMunicipalities = data;
          this.pieChartMunicipalityData =
            this.totalExpensesAllMunicipalities.map((data) => [
              data.municipality,
              data.sum_amount,
              data.municipality_uid,
            ]);
            this.sharedService.endRequest();
        },
        error: (error) => {
          console.log(error);
          this.sharedService.endRequest();
        },
      });
    }
  }

 // Loading Spinners

 isLoading(): boolean {
  return this.sharedService.isLoading();
}

  // Column Chart Configuration
  columnChartRegionThematicNames = [
    'Περιφέρεια',
    'Έξοδα',
    { type: 'string', role: 'none' },
  ];
  barChartRegionKaeNames = [
    'Περιφέρεια',
    'Έξοδα',
    { type: 'string', role: 'none' },
  ];
  columnChartMunicipalityThematicNames = [
    'Δήμος',
    'Έξοδα',
    { type: 'string', role: 'none' },
  ];
  columnChartMunicipalityKaeNames = [
    'Δήμος',
    'Έξοδα',
    { type: 'string', role: 'none' },
  ];

  columnChartRegionThematicOptions = {
    title: 'Οι 10 περιφέρειες με τα μεγαλύτερα έξοδα (Θεματική Κατηγορία) ',
    width: 1000,
    height: 1000,
    legend: { position: 'top', alignment: 'end' },
    hAxis: { title: 'Περιφέρεια' },
    vAxis: { title: 'Έξοδα' },
    bar: { groupWidth: '75%' },
  };

  columnChartMunicipalityThematicOptions = {
    title: 'Οι 10 δήμοι με τα μεγαλύτερα έξοδα (Θεματική Κατηγορία) ',
    width: 1000,
    height: 1000,
    legend: { position: 'top', alignment: 'end' },
    hAxis: { title: 'Δήμος' },
    vAxis: { title: 'Έξοδα', format: '#,##0.00' },
    bar: { groupWidth: '75%' },
  };

  barChartRegionKaeOptions = {
    title: 'Οι 10 περιφέρειες με τα μεγαλύτερα έξοδα (ΚΑΕ) ',
    width: 1000,
    height: 1000,
    legend: { position: 'top', alignment: 'end' },
    hAxis: { title: 'Περιφέρεια' },
    vAxis: { title: 'Έξοδα' },
    bar: { groupWidth: '75%' },
  };

  columnChartMunicipalityKaeOptions = {
    title: 'Οι 10 δήμοι με τα μεγαλύτερα έξοδα (ΚΑΕ)',
    width: 1000,
    height: 1000,
    legend: { position: 'top', alignment: 'end' },
    hAxis: { title: 'Δήμος' },
    vAxis: { title: 'Έξοδα' },
    bar: { groupWidth: '75%' },
  };

  // Pie Chart Configuration
  pieChartRegionOptions = {
    title: 'Συνολικά Έξοδα ανά περιφέρεια',
    width: 1300,
    height: 1000,
  };

  // Pie Chart Configuration
  pieChartMunicipalityOptions = {
    title: 'Συνολικά Έξοδα ανά δήμο',
    width: 1300,
    height: 800,
    pieSliceTextStyle: {
      fontSize: 12,
    },
  };


  // Chart Event - Regions

  onColumnChartRegionThematicSelect(event: any) {
    if (event.selection.length > 0) {
      const selectedItem = event.selection[0];
      const selectedRegionUid =
        this.columnChartRegionThematicData[selectedItem.row!][2];
      this.router.navigate([
        '/expenses-region',
        selectedRegionUid,
        'expenses-per-thematic-tab',
      ]);
    }
  }

  onBarChartRegionKaeSelect(event: any) {
    if (event.selection.length > 0) {
      const selectedItem = event.selection[0];
      const selectedRegionUid =
        this.barChartRegionKaeData[selectedItem.row!][2];
      this.router.navigate([
        '/expenses-region',
        selectedRegionUid,
        'expenses-per-kae-tab',
      ]);
    }
  }

  onPieChartRegionSelect(event: any) {
    if (event.selection.length > 0) {
      const selectedItem = event.selection[0];
      const selectedRegionUid = this.pieChartRegionData[selectedItem.row!][2];
    }
  }

  onColumnChartRegionThematicMouseOver(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-region-thematic svg'
    );
    if (chartElement) {
      chartElement.style.cursor = 'pointer';
    }
  }

  onColumnChartRegionThematicMouseLeave(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-region-thematic svg'
    );
    if (chartElement) {
      chartElement.style.cursor = '';
    }
  }

  onBarChartRegionKaeMouseOver(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-region-kae svg'
    );
    if (chartElement) {
      chartElement.style.cursor = 'pointer';
    }
  }

  onBarChartRegionKaeMouseLeave(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-region-kae svg'
    );
    if (chartElement) {
      chartElement.style.cursor = '';
    }
  }

  onPieChartRegionMouseOver(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-region svg'
    );
    if (chartElement) {
      chartElement.style.cursor = 'pointer';
    }
  }

  onPieChartRegionMouseLeave(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-region svg'
    );
    if (chartElement) {
      chartElement.style.cursor = '';
    }
  }

  // Chart Event - Municipalities

  onColumnChartMunicipalityThematicSelect(event: any) {
    if (event.selection.length > 0) {
      const selectedItem = event.selection[0];
      const selectedMunicipalityUid =
        this.columnChartMunicipalityThematicData[selectedItem.row!][2];
      this.router.navigate([
        '/expenses-municipality',
        selectedMunicipalityUid,
        'expenses-per-thematic-tab',
      ]);
    }
  }

  onColumnChartMunicipalityKaeSelect(event: any) {
    if (event.selection.length > 0) {
      const selectedItem = event.selection[0];
      const selectedMunicipalityUid =
        this.columnChartMunicipalityKaeData[selectedItem.row!][2];
      this.router.navigate([
        '/expenses-municipality',
        selectedMunicipalityUid,
        'expenses-per-kae-tab',
      ]);
    }
  }

  onPieChartMunicipalitySelect(event: any) {
    if (event.selection.length > 0) {
      const selectedItem = event.selection[0];
      const selectedValue = this.pieChartMunicipalityData[selectedItem.row!][2];
    }
  }

  onColumnChartMunicipalityThematicMouseOver(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-municipality-thematic svg'
    );
    if (chartElement) {
      chartElement.style.cursor = 'pointer';
    }
  }

  onColumnChartMunicipalityThematicMouseLeave(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-municipality-thematic svg'
    );
    if (chartElement) {
      chartElement.style.cursor = '';
    }
  }

  onColumnChartMunicipalityKaeMouseOver(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-municipality-kae svg'
    );
    if (chartElement) {
      chartElement.style.cursor = 'pointer';
    }
  }

  onColumnChartMunicipalityKaeMouseLeave(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-municipality-kae svg'
    );
    if (chartElement) {
      chartElement.style.cursor = '';
    }
  }

  onPieChartMunicipalityMouseOver(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-municipality svg'
    );
    if (chartElement) {
      chartElement.style.cursor = 'pointer';
    }
  }

  onPieChartMunicipalityMouseLeave(event: any) {
    const chartElement: HTMLElement | null = document.querySelector(
      '.chart-selectable-municipality svg'
    );
    if (chartElement) {
      chartElement.style.cursor = '';
    }
  }
}

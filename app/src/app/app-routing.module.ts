import { HomePageNewComponent} from './components/pages/home-page-new/home-page-new.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamPanelComponent } from './components/pages/team-panel/team-panel.component';
import { InfoComponent } from './components/pages/info/info.component';
import { StatisticsComponent } from './components/pages/statistics/statistics.component';
import { ExpensesMunicipalityComponent } from './components/pages/expenses-municipality/expenses-municipality.component';
import { ExpensesRegionComponent } from './components/pages/expenses-region/expenses-region.component';
import { OlmapComponent } from './components/olmap/olmap.component';
import { PersonalListComponent } from './components/user/personal-list/personal-list.component';
import { AuthGuard } from './guard/auth.guard';
import { NotesComponent } from './components/user/notes/notes.component';

const routes: Routes = [
  { path: '', redirectTo: 'home-page', pathMatch: 'full' },
  { path: 'home-page', component: HomePageNewComponent },
  { path: 'team-panel', component: TeamPanelComponent },
  { path: 'statistics', component: StatisticsComponent },
  { path: 'info', component: InfoComponent },
  { path: 'expenses-municipality', component: ExpensesMunicipalityComponent },
  { path: 'expenses-municipality/:municipalityUid/:activeTabId', component: ExpensesMunicipalityComponent },
  { path: 'expenses-municipality-label/:municipalityLabel/:activeTabId', component: ExpensesMunicipalityComponent },
  { path: 'expenses-region', component: ExpensesRegionComponent },
  { path: 'expenses-region/:regionUid/:activeTabId', component: ExpensesRegionComponent },
  { path: 'expenses-region-label/:regionLabel/:activeTabId', component: ExpensesRegionComponent },
  { path: 'olmap', component: OlmapComponent },
  { path: 'personal-list', component: PersonalListComponent, canActivate: [AuthGuard] },
  { path: 'notes', component: NotesComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

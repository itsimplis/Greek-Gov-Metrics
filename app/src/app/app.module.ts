import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { GoogleChartsModule } from 'angular-google-charts';
import { TeamPanelComponent } from './components/pages/team-panel/team-panel.component';
import { HomePageNewComponent } from './components/pages/home-page-new/home-page-new.component';
import { FooterComponent } from './components/footer/footer.component';
import { InfoComponent } from './components/pages/info/info.component';
import { HttpClientModule } from '@angular/common/http';
import { StatisticsComponent } from './components/pages/statistics/statistics.component';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { FormsModule } from '@angular/forms';
import { ExpensesRegionComponent } from './components/pages/expenses-region/expenses-region.component';
import { ExpensesMunicipalityComponent } from './components/pages/expenses-municipality/expenses-municipality.component';
import { ViewDetailsComponent } from './components/modals/view-details/view-details.component';
import { OlmapComponent } from './components/olmap/olmap.component';
import { MapDetailsComponent } from './components/modals/map-details/map-details.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RegistrationComponent } from './components/modals/registration/registration.component';
import { LoginComponent } from './components/modals/login/login.component';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { PersonalListComponent } from './components/user/personal-list/personal-list.component';
import { NoteComponent } from './components/modals/note/note.component';
import { NotesComponent } from './components/user/notes/notes.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    TeamPanelComponent,
    HomePageNewComponent,
    FooterComponent,
    InfoComponent,
    StatisticsComponent,
    FilterBarComponent,
    OlmapComponent,
    ExpensesRegionComponent,
    ExpensesMunicipalityComponent,
    ViewDetailsComponent,
    RegistrationComponent,
    LoginComponent,
    MapDetailsComponent,
    PersonalListComponent,
    NoteComponent,
    NotesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    BrowserAnimationsModule,
    GoogleChartsModule.forRoot({ mapsApiKey: 'Your API Key Here'})
  ],
  providers: [
    JwtHelperService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS }],
  bootstrap: [AppComponent]
})

export class AppModule { }

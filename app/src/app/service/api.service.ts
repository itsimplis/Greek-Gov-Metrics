import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl: string = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  // Call Python API
  getDataArray(requestType: string): Observable<any[]> {
    let url = this.baseUrl;

    if (requestType == 'all') {
      // root url, no change
    } else if (requestType == 'dimoi') {
      url += '/dimoi/sample_data';
    } else if (requestType == 'single') {
      url += '/dimoi/1';
    }

    return this.http.get<any[]>(url);
  }

  // Call Python API
  getData(requestType: string): Observable<any> {
    let url = this.baseUrl;

    if (requestType == 'single') {
      url += '/dimoi/1';
    }

    return this.http.get(url);
  }

  // Call Python API to get general data (.xlsx), based on type asked
  getGeneralData(type: string): Observable<any[]> {
    let url = this.baseUrl + '/general_data/' + type;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  /* ====================================== *
   * Get Requests for multiple JSON objects *
   * ====================================== */

  // [GET] Get Decisions
  getDecisions(): Observable<any[]> {
    let url = this.baseUrl + '/decisions/?type=decision';
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Decision Types
  getDecisionTypes(): Observable<any[]> {
    let url = this.baseUrl + '/decisions/?type=decision_type';
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Kaes
  getKaes(): Observable<any[]> {
    let url = this.baseUrl + '/decisions/?type=kae';
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Municipalities
  getMunicipalities(): Observable<any[]> {
    let url = this.baseUrl + '/decisions/?type=municipality';
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Regions
  getRegions(): Observable<any[]> {
    let url = this.baseUrl + '/decisions/?type=region';
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Thematic Categories
  getThematicCategories(): Observable<any[]> {
    let url = this.baseUrl + '/decisions/?type=thematic_category';
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  // [GET] Get single decision
  getDecision(id: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/decision/?id=${id}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  // [GET] Get Municipalities that only exist in decisions table
  getMunicipalitiesOfDecisions(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municipalities/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  // [GET] Get Regions whose municipalities only exist in decisions table
  getRegionsOfDecisions(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/regions/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  // [GET] Get Thematic Categories for a specific region
  getThematicCategoriesPerRegion(region: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/regions/thematic/?region=${region}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Kaes for a specific region
  getKaesPerRegion(region: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/regions/kaes/?region=${region}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  // [GET] Get Thematic Categories for a specific municipality
  getThematicCategoriesPerMunicipality(
    municipality: string
  ): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municipalities/thematic/?municipality=${municipality}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Kaes for a specific municipality
  getKaesPerMunicipality(municipality: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municipalities/kaes/?municipality=${municipality}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  // [GET] Get Sum of Expenses for each Thematic Category, per municipality
  getMunicipalityExpensesAllThematic(municipality: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municiplities/expensesAllThematic/?municipality=${municipality}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Expenses per municipality, per Thematic category
  getMunicipalityExpensesPerThematic(
    municipality: string,
    thematic: string
  ): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municiplities/expensesPerThematic/?municipality=${municipality}&thematic_category=${thematic}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Sum of Expenses for each Kae, per municipality
  getMunicipalityExpensesAllKae(municipality: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municiplities/expensesAllKae/?municipality=${municipality}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Expenses per municipality, per Kae
  getMunicipalityExpensesPerKae(
    municipality: string,
    kae: string
  ): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municiplities/expensesPerKae/?municipality=${municipality}&kae=${kae}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  // [GET] Get Sum of Expenses for each Thematic Category, per region
  getRegionExpensesAllThematic(region: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/regions/expensesAllThematic/?region=${region}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Expenses per region, per Thematic category
  getRegionExpensesPerThematic(
    region: string,
    thematic: string
  ): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/regions/expensesPerThematic/?region=${region}&thematic_category=${thematic}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Sum of Expenses for each Kae, per region
  getRegionExpensesAllKae(region: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/regions/expensesAllKae/?region=${region}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Expenses per region, per Kae
  getRegionExpensesPerKae(region: string, kae: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/regions/expensesPerKae/?region=${region}&kae=${kae}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  getTopTenThematicExpenseRegions(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/region/topThematic/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  getTopTenKaeExpenseRegions(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/region/topKae/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  getTotalExpensesAllRegions(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/region/totalThematicExpenses/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  getTopTenThematicExpenseMunicipalities(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municipality/topThematic/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  getTopTenKaeExpenseMunicipalities(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municipality/topKae/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  getTotalExpensesAllMunicipalities(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municipality/totalThematicExpenses/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  // [GET] Get Sum of Expenses for a Municipality, compared to its Region
  getExpensesPerMunicipalityComparedToRegion(
    municipality: string
  ): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municipality/municipalityOfRegionsExpenses/?municipality=${municipality}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  // [POST] Send user details to register
  registerUser(
    username: string,
    email: string,
    password: string,
    password2: string
  ): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/register`, {
      username: username,
      email: email,
      password: password,
      password2: password2,
    });
  }

  // [POST] Send user credentials to login
  loginUser(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/login`, {
      username: username,
      password: password,
    });
  }

  //===============================================================================================

  // [POST] Add a decision to the personal list of the currently logged-in user
  addDecisionToPersonalList(username: string, ada: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/listdecision/add`, {
      username: username,
      ada: ada,
      note: '',
      note_tag: '',
    });
  }

  // [POST] Remove a decision from the personal list of the currently logged-in user
  removeDecisionFromPersonalList(
    username: string,
    ada: string
  ): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/listdecision/remove`, {
      username: username,
      ada: ada,
      note: '',
      note_tag: '',
    });
  }

  // [POST] Remove *all decisions* from the personal list of the currently logged-in user
  removeAllDecisionsFromPersonalList(username: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/listdecision/removeAll`, {
      username: username,
      ada: '',
      note: '',
      note_tag: '',
    });
  }

  //===============================================================================================

  // [GET] Get Sum of Expenses for a Municipality, compared to its Region
  getPersonalListOfDecisions(username: string): Observable<any[]> {
    const url = `${this.baseUrl}/users/listdecision?username=${username}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  // [GET] Get municipality data from map modal
  getMunicipalityData(municicpality: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municipalityData/?municipality=${municicpality}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Region data from map modal
  getRegionData(region: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/regionData/?region=${region}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===============================================================================================

  // [GET] Get all notes for a user
  getAllNotes(username: string): Observable<any[]> {
    const url = `${this.baseUrl}/users/notes?username=${username}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Note from a decision in personal list
  getNote(username: string, ada: string): Observable<any[]> {
    const url = `${this.baseUrl}/users/listdecision/note?username=${username}&ada=${ada}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [POST] Add a note to the decision in the personal list of the currently logged-in user
  addNote(
    username: string,
    ada: string,
    note: string,
    note_tag: string
  ): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/listdecision/note/add`, {
      username: username,
      ada: ada,
      note: note,
      note_tag: note_tag,
    });
  }

  //=============================[GET] TOP 5 MUNICIPALITIES IN DECISIONS COUNT=================================================================
  getMunicipalitiesTop5Decisions(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municipality/top5decisions/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  getRegionsTop5Decisions(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/region/top5decisions/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //============================ [GET] DECISIONS UNDER 1 EURO==================================================================
  getDecisionsUnder1Euro(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/statistics/decisionsunder1euro/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //=================== [GET] DECISIONS OVER 1 MIL EUROS===========================================================================
  getDecisionsOver1MilEuro(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/statistics/decisionsover1millioneuro/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===================[GET] latest update of DB===========================================================================

  getLatestUpdate(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/statistics/latestupdate/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

   //===================[GET] first update of DB===========================================================================

   getFirstUpdate(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/statistics/firstupdate/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

     //===================[GET] municipality with most expenses ===========================================================================

     getMunMostExpenses(): Observable<any[]> {
      const url = `${this.baseUrl}/decisions/statistics/municipality/mostexpenses/`;
      return this.http.get<any[]>(url, { withCredentials: true });
    }

    //===================[GET] region with most expenses ===========================================================================

   getRegMostExpenses(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/statistics/region/mostexpenses/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===================[GET] COUNT OF DECISIONS FOR THE CURRENT YEAR===========================================================================
  getDecisionsCurrentYear(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/statistics/decisionscurrentyear/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===================TOP 5 THEMATIC CATEGORIES===========================================================================
  getTop5Thematic(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/statistics/top5thematic/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===================[GET] TOP 5 KAE===========================================================================
  getTop5Kae(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/statistics/top5kae/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  //===================[GET] TOP 5 KAE===========================================================================
  getTop5Signers(): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/statistics/top5signers/`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get municipality thematic expenses per year
  getMunicipalityThematicExpensesPerYear(municipality: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municipality/thematicexpensesperyear/?municipality=${municipality}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get municipality KAE expenses per year
  getMunicipalityKaeExpensesPerYear(municipality: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/municipality/kaeexpensesperyear/?municipality=${municipality}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get Region data from map modal
  getRegionThematicExpensesPerYear(region: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/region/thematicexpensesperyear/?region=${region}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }

  // [GET] Get kae expenses per year
  getRegionKaeExpensesPerYear(region: string): Observable<any[]> {
    const url = `${this.baseUrl}/decisions/region/kaeexpensesperyear/?region=${region}`;
    return this.http.get<any[]>(url, { withCredentials: true });
  }





}

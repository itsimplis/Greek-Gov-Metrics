import { Component, OnInit } from '@angular/core';
import { Person } from '../../../model/person';

@Component({
  selector: 'app-team-panel',
  templateUrl: './team-panel.component.html',
  styleUrls: ['./team-panel.component.scss']
})

export class TeamPanelComponent{

  persons: Array<Person>;

  constructor() {
    this.persons = new Array<Person>();
    this.addPersons();
  }

  private addPersons() {
    this.persons.push(new Person('Georgios Antoniadis', 'Backend - Data', '../../assets/profile-images/georgios.png', 'https://github.com/georgios-antoniadis', 'https://github.com/georgios-antoniadis'));
    this.persons.push(new Person('Giannis Christopoulos', 'Frontend - Backend', '../../assets/profile-images/giannis.png', 'https://www.linkedin.com/in/giannis-christopoulos747/', 'https://github.com/ioanchri'));
    this.persons.push(new Person('Spyridon Armaos', 'Backend - Data', '../../assets/profile-images/spyridon1.png', 'https://github.com/georgios-antoniadis', 'https://github.com/sarmaos'));
    this.persons.push(new Person('Iasonas Tsimplis', 'Frontend - Backend', '../../assets/profile-images/iasonas.png', 'https://www.linkedin.com/in/iasonas-tsimplis/', 'https://github.com/itsimplis'));
    this.persons.push(new Person('Spyridon Sioutis', 'Backend - Data', '../../assets/profile-images/spyridon2.png', 'https://github.com/georgios-antoniadis', 'https://letmegooglethat.com/?q=Amazing+huh+!'));
  }

  onButtonClick(url: String) {
    window.open(url.toString(), "_blank");
  }
}

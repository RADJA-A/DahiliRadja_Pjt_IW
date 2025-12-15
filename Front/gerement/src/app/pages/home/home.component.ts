import { Component } from '@angular/core';
import {AvantagesComponent} from '../../components/avantages/avantages.component';
import {ProcedureComponent} from '../../components/procedure/procedure.component';
import {ServicesComponent} from '../../components/services/services.component';


@Component({
  selector: 'app-home',
   imports: [AvantagesComponent,ProcedureComponent,ServicesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}

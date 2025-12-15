import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SigninComponent } from './pages/signin/signin.component';

// Organisateur
import { DashboardOrganisateurComponent } from './pages/organisateur/dashboard-organisateur/dashboard-organisateur.component';
import { MesEvenementsComponent } from './pages/organisateur/mes-evenements/mes-evenements.component';
import { CreerEvenementComponent } from './pages/organisateur/creer-evenement/creer-evenement.component';
import { ParticipantsEvenementComponent } from './pages/organisateur/participants-evenement/participants-evenement.component';

// Participant
import { EvenementsDisponiblesComponent } from './pages/participant/evenements-disponibles/evenements-disponibles.component';
import { MesInscriptionsComponent } from './pages/participant/mes-inscriptions/mes-inscriptions.component';
import { DetailEvenementComponent } from './pages/participant/detail-evenement/detail-evenement.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signin', component: SigninComponent },

  // Routes Organisateur
  { path: 'organisateur/dashboard', component: DashboardOrganisateurComponent },
  { path: 'organisateur/mes-evenements', component: MesEvenementsComponent },
  { path: 'organisateur/creer-evenement', component: CreerEvenementComponent },
  { path: 'organisateur/participants/:id', component: ParticipantsEvenementComponent },

  // Routes Participant
  { path: 'participant/evenements-disponibles', component: EvenementsDisponiblesComponent },
  { path: 'participant/mes-inscriptions', component: MesInscriptionsComponent },
  { path: 'participant/evenement/:id', component: DetailEvenementComponent },

  { path: '**', redirectTo: '' }
];
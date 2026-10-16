import { Routes } from '@angular/router';
import { ProdEnvComponent } from './pages/prod-env/prod-env.component';
import { DevEnvComponent } from './pages/dev-env/dev-env.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'prod'
  },
  {
    path: 'prod',
    component: ProdEnvComponent,
    title: 'BotBuster - Prod Environment'
  },
  {
    path: 'dev',
    component: DevEnvComponent,
    title: 'BotBuster - Dev Environment'
  },
  {
    path: '**',
    redirectTo: 'prod'
  }
];

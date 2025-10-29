import { Routes } from '@angular/router';
import { WebsiteMainLayoutComponent } from './views/partial/website-main-layout/website-main-layout.component';
import { PageNotFoundComponent } from './views/partial/page-not-found/page-not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: WebsiteMainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      // { path: 'home', component: HomeComponent },
      // { path: 'about', component: AboutComponent },
      // { path: 'contact', component: ContactComponent },
    ],
  },
  { path: '**', component: PageNotFoundComponent },
];
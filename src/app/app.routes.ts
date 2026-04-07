import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'topics',
    loadComponent: () => import('./pages/topics/topics.component').then(m => m.TopicsComponent)
  },
  {
    path: 'questions',
    loadComponent: () => import('./pages/questions/questions.component').then(m => m.QuestionsComponent)
  },
  {
    path: 'questions/:id',
    loadComponent: () => import('./pages/question-detail/question-detail.component').then(m => m.QuestionDetailComponent)
  },
  {
    path: 'tags',
    loadComponent: () => import('./pages/tags/tags.component').then(m => m.TagsComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];

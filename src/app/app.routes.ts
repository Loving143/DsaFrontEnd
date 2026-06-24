import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
<<<<<<< HEAD
    path: 'daily-challenge',
    loadComponent: () => import('./pages/daily-challenge/daily-challenge.component').then(m => m.DailyChallengeComponent)
  },
  {
=======
>>>>>>> 12c312ec3e26b7ed7bd08b5d2a3b0bd8fc2032c9
    path: 'topics',
    loadComponent: () => import('./pages/topics/topics.component').then(m => m.TopicsComponent)
  },
  {
    path: 'questions',
    loadComponent: () => import('./pages/questions/questions.component').then(m => m.QuestionsComponent)
  },
  {
<<<<<<< HEAD
    path: 'topics/:id/questions',
    loadComponent: () => import('./pages/topic-questions/topic-questions.component').then(m => m.TopicQuestionsComponent)
  },
  {
=======
>>>>>>> 12c312ec3e26b7ed7bd08b5d2a3b0bd8fc2032c9
    path: 'questions/:id',
    loadComponent: () => import('./pages/question-detail/question-detail.component').then(m => m.QuestionDetailComponent)
  },
  {
    path: 'tags',
    loadComponent: () => import('./pages/tags/tags.component').then(m => m.TagsComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];

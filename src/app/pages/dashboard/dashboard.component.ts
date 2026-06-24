import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Topic, Question } from '../../core/models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      <!-- Hero -->
      <div class="mb-10">
        <h1 class="text-4xl font-bold text-white mb-2">
          Welcome back 👋
        </h1>
        <p class="text-dark-400 text-lg">Track your DSA progress and crush those interviews.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div *ngFor="let stat of stats"
             class="bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" [class]="stat.iconBg">
              <span [innerHTML]="stat.icon"></span>
            </div>
            <span class="text-xs font-medium px-2 py-1 rounded-full" [class]="stat.badgeClass">{{ stat.badge }}</span>
          </div>
          <div class="text-3xl font-bold text-white mb-1">{{ stat.value }}</div>
          <div class="text-sm text-dark-400">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Progress + Recent -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        <!-- Progress Breakdown -->
        <div class="bg-dark-800 border border-dark-700 rounded-2xl p-6">
          <h2 class="text-lg font-semibold text-white mb-5">Progress Overview</h2>
          <div class="space-y-4">
            <div *ngFor="let p of progressStats">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-dark-300">{{ p.label }}</span>
                <span class="font-medium" [class]="p.color">{{ p.count }}</span>
              </div>
              <div class="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700" [class]="p.barColor"
                     [style.width.%]="totalQuestions > 0 ? (p.count / totalQuestions) * 100 : 0"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Difficulty Breakdown -->
        <div class="bg-dark-800 border border-dark-700 rounded-2xl p-6">
          <h2 class="text-lg font-semibold text-white mb-5">By Difficulty</h2>
          <div class="space-y-4">
            <div *ngFor="let d of difficultyStats">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-dark-300">{{ d.label }}</span>
                <span class="font-medium" [class]="d.color">{{ d.count }}</span>
              </div>
              <div class="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700" [class]="d.barColor"
                     [style.width.%]="totalQuestions > 0 ? (d.count / totalQuestions) * 100 : 0"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Topics Summary -->
        <div class="bg-dark-800 border border-dark-700 rounded-2xl p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-semibold text-white">Topics</h2>
            <a routerLink="/topics" class="text-xs text-primary-400 hover:text-primary-300 transition-colors">View all →</a>
          </div>
          <div class="space-y-3">
            <div *ngFor="let topic of topics.slice(0, 6)"
                 class="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-colors cursor-pointer"
                 [routerLink]="['/topics', topic.id, 'questions']">
              <span class="text-sm text-dark-200 font-medium">{{ topic.name }}</span>
              <span class="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-medium">
                {{ topic.questionCount }}
              </span>
            </div>
            <div *ngIf="topics.length === 0" class="text-center text-dark-500 text-sm py-4">No topics yet</div>
          </div>
        </div>
      </div>

      <!-- Recent Questions -->
      <div class="bg-dark-800 border border-dark-700 rounded-2xl p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-semibold text-white">Recent Questions</h2>
          <a routerLink="/questions" class="text-xs text-primary-400 hover:text-primary-300 transition-colors">View all →</a>
        </div>
        <div class="space-y-3">
          <div *ngFor="let q of recentQuestions"
               [routerLink]="['/questions', q.id]"
               class="flex items-center justify-between p-4 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-all cursor-pointer group">
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-lg">{{ q.isFavorite ? '⭐' : '📝' }}</span>
              <div class="min-w-0">
                <div class="text-sm font-medium text-white group-hover:text-primary-400 transition-colors truncate">{{ q.title }}</div>
                <div class="text-xs text-dark-400 mt-0.5">{{ q.topicName }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-4">
              <span class="text-xs px-2 py-1 rounded-full font-medium" [class]="getDifficultyClass(q.difficulty)">{{ q.difficulty }}</span>
              <span class="text-xs px-2 py-1 rounded-full font-medium" [class]="getStatusClass(q.status)">{{ q.status.replace('_', ' ') }}</span>
            </div>
          </div>
          <div *ngIf="recentQuestions.length === 0" class="text-center text-dark-500 text-sm py-6">No questions yet. Add some!</div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  topics: Topic[] = [];
  recentQuestions: Question[] = [];
  totalQuestions = 0;

  stats: any[] = [];
  progressStats: any[] = [];
  difficultyStats: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    forkJoin({
      topics: this.api.getTopics(),
      questions: this.api.getQuestions(0, 50)
    }).subscribe(({ topics, questions }) => {
      this.topics = topics;
      const all = questions.content;
      this.totalQuestions = questions.totalElements;
      this.recentQuestions = all.slice(0, 8);

      const completed = all.filter(q => q.status === 'COMPLETED').length;
      const inProgress = all.filter(q => q.status === 'IN_PROGRESS').length;
      const notStarted = all.filter(q => q.status === 'NOT_STARTED').length;
      const favorites = all.filter(q => q.isFavorite).length;
      const easy = all.filter(q => q.difficulty === 'EASY').length;
      const medium = all.filter(q => q.difficulty === 'MEDIUM').length;
      const hard = all.filter(q => q.difficulty === 'HARD').length;

      this.stats = [
        { value: topics.length, label: 'Total Topics', badge: 'Active', badgeClass: 'bg-blue-500/20 text-blue-400', iconBg: 'bg-blue-500/20', icon: `<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>` },
        { value: this.totalQuestions, label: 'Total Questions', badge: 'All', badgeClass: 'bg-purple-500/20 text-purple-400', iconBg: 'bg-purple-500/20', icon: `<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
        { value: completed, label: 'Completed', badge: `${this.totalQuestions > 0 ? Math.round((completed/this.totalQuestions)*100) : 0}%`, badgeClass: 'bg-green-500/20 text-green-400', iconBg: 'bg-green-500/20', icon: `<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
        { value: favorites, label: 'Favorites', badge: '⭐', badgeClass: 'bg-yellow-500/20 text-yellow-400', iconBg: 'bg-yellow-500/20', icon: `<svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>` },
      ];

      this.progressStats = [
        { label: 'Completed', count: completed, color: 'text-green-400', barColor: 'bg-green-500' },
        { label: 'In Progress', count: inProgress, color: 'text-yellow-400', barColor: 'bg-yellow-500' },
        { label: 'Not Started', count: notStarted, color: 'text-dark-400', barColor: 'bg-dark-500' },
      ];

      this.difficultyStats = [
        { label: 'Easy', count: easy, color: 'text-green-400', barColor: 'bg-green-500' },
        { label: 'Medium', count: medium, color: 'text-yellow-400', barColor: 'bg-yellow-500' },
        { label: 'Hard', count: hard, color: 'text-red-400', barColor: 'bg-red-500' },
      ];
    });
  }

  getDifficultyClass(d: string) {
    return { EASY: 'bg-green-500/20 text-green-400', MEDIUM: 'bg-yellow-500/20 text-yellow-400', HARD: 'bg-red-500/20 text-red-400' }[d] ?? '';
  }
  getStatusClass(s: string) {
    return { COMPLETED: 'bg-green-500/20 text-green-400', IN_PROGRESS: 'bg-blue-500/20 text-blue-400', NOT_STARTED: 'bg-dark-600 text-dark-400' }[s] ?? '';
  }
}

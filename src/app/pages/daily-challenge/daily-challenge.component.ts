import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DailyChallengeService } from '../../core/services/daily-challenge.service';
import { DailyChallenge, DailyChallengeQuestion, ScoreEntry } from '../../core/models/models';

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  status: 'completed' | 'partial' | 'missed' | 'future' | 'none';
  score: number;
}

@Component({
  selector: 'app-daily-challenge',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

  <!-- Header -->
  <div class="flex items-start justify-between mb-6 gap-4 flex-wrap">
    <div>
      <div class="flex items-center gap-3 mb-1">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-yellow-500/30 border border-orange-500/40 flex items-center justify-center">
          <span class="text-xl">🔥</span>
        </div>
        <h1 class="text-3xl font-bold text-white">Daily Challenge</h1>
      </div>
      <p class="text-dark-400 mt-1 ml-1">{{ todayLabel }} · Solve all 3 to earn today's points</p>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-2">
        <span>🔥</span>
        <div>
          <p class="text-orange-400 font-bold text-xl leading-none">{{ stats.currentStreak }}</p>
          <p class="text-orange-400/60 text-xs">streak</p>
        </div>
      </div>
      <div class="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
        <span>⭐</span>
        <div>
          <p class="text-yellow-400 font-bold text-xl leading-none">{{ stats.totalScore }}</p>
          <p class="text-yellow-400/60 text-xs">total pts</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Stats strip -->
  <div class="grid grid-cols-4 gap-3 mb-6">
    <div class="bg-dark-800 border border-dark-700 rounded-xl p-3 text-center">
      <p class="text-xl font-bold text-white">{{ stats.totalScore }}</p>
      <p class="text-xs text-dark-400 mt-0.5">Total Score</p>
    </div>
    <div class="bg-dark-800 border border-dark-700 rounded-xl p-3 text-center">
      <p class="text-xl font-bold text-orange-400">{{ stats.currentStreak }}</p>
      <p class="text-xs text-dark-400 mt-0.5">Streak</p>
    </div>
    <div class="bg-dark-800 border border-dark-700 rounded-xl p-3 text-center">
      <p class="text-xl font-bold text-yellow-400">{{ stats.longestStreak }}</p>
      <p class="text-xs text-dark-400 mt-0.5">Best Streak</p>
    </div>
    <div class="bg-dark-800 border border-dark-700 rounded-xl p-3 text-center">
      <p class="text-xl font-bold text-green-400">{{ stats.daysCompleted }}</p>
      <p class="text-xs text-dark-400 mt-0.5">Days Done</p>
    </div>
  </div>

  <!-- Main: Questions (left, 2/3) + Calendar (right, 1/3) -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

    <!-- Questions panel -->
    <div class="lg:col-span-2 flex flex-col gap-4">

      <!-- Loading -->
      <div *ngIf="loading" class="bg-dark-800 border border-dark-700 rounded-2xl p-12 flex flex-col items-center justify-center">
        <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-dark-400 text-sm">Picking today's questions...</p>
      </div>

      <!-- No questions -->
      <div *ngIf="!loading && (!activeChallenge || activeChallenge.questions.length === 0)"
           class="bg-dark-800 border border-dark-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <span class="text-5xl mb-3">📚</span>
        <p class="text-white font-semibold">{{ selectedDateKey === todayKey ? 'No questions yet' : 'No data for this day' }}</p>
        <p class="text-dark-400 text-sm mt-1">{{ selectedDateKey === todayKey ? 'Add questions to your topics first' : 'You did not attempt this day' }}</p>
        <a *ngIf="selectedDateKey === todayKey" routerLink="/questions"
           class="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors">
          Add Questions
        </a>
      </div>

      <!-- Challenge panel -->
      <div *ngIf="!loading && activeChallenge && activeChallenge.questions.length > 0"
           class="bg-dark-800 border border-dark-700 rounded-2xl p-5">

        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-white font-bold text-lg">{{ selectedDateKey === todayKey ? "Today's Challenge" : formatDate(selectedDateKey) }}</p>
            <p class="text-dark-400 text-sm mt-0.5">
              {{ activeSolvedCount }} of {{ activeChallenge.questions.length }} solved
              · <span class="text-yellow-400 font-semibold">+{{ activeChallenge.score }} pts</span>
            </p>
          </div>
          <span *ngIf="activeChallenge.completed"
                class="text-sm bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-semibold">
            🎉 Complete
          </span>
          <span *ngIf="!activeChallenge.completed && selectedDateKey !== todayKey"
                class="text-sm bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-medium">
            Incomplete
          </span>
        </div>

        <!-- Progress bar -->
        <div class="h-2 bg-dark-700 rounded-full overflow-hidden mb-5">
          <div class="h-full rounded-full transition-all duration-700"
               [style.width.%]="activeProgressPct"
               [class]="activeChallenge.completed
                 ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                 : 'bg-gradient-to-r from-primary-600 to-primary-400'">
          </div>
        </div>

        <!-- Question cards -->
        <div class="space-y-3">
          <div *ngFor="let item of activeChallenge.questions; let i = index"
               class="relative rounded-2xl p-5 border transition-all duration-200"
               [class]="item.solved
                 ? 'bg-green-500/5 border-green-500/25 shadow-sm shadow-green-500/10'
                 : 'bg-dark-700/40 border-dark-600 hover:border-primary-500/40'">

            <div *ngIf="item.solved"
                 class="absolute top-4 right-4 w-7 h-7 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base font-bold"
                   [class]="item.solved ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'">
                {{ item.solved ? '✓' : (i + 1) }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-base leading-snug mb-2"
                    [class]="item.solved ? 'text-dark-400 line-through' : 'text-white'">
                  {{ item.question.title }}
                </h3>
                <p class="text-dark-400 text-sm leading-relaxed mb-3 line-clamp-2">
                  {{ item.question.description || 'No description available.' }}
                </p>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="inline-flex items-center gap-1 text-xs bg-dark-700 text-dark-300 px-2.5 py-1 rounded-lg">
                    📂 {{ item.question.topicName }}
                  </span>
                  <span class="text-xs px-2.5 py-1 rounded-full font-semibold" [class]="getDiffClass(item.question.difficulty)">
                    {{ item.question.difficulty }}
                  </span>
                  <span class="text-xs text-primary-400 font-semibold bg-primary-500/10 px-2.5 py-1 rounded-full">
                    +{{ getScore(item.question.difficulty) }} pts
                  </span>
                  <span *ngIf="item.solved && item.solvedAt" class="text-xs text-dark-500">
                    ✓ {{ formatTime(item.solvedAt) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 mt-4 pl-14">
              <a [routerLink]="['/questions', item.question.id]"
                 class="text-sm px-4 py-2 rounded-xl font-medium transition-colors"
                 [class]="item.solved ? 'bg-dark-600 text-dark-300 hover:text-white' : 'bg-primary-600 hover:bg-primary-500 text-white'">
                {{ item.solved ? '👁 Review' : '→ Solve Now' }}
              </a>
              <button *ngIf="!item.solved && selectedDateKey === todayKey && !activeChallenge.completed"
                      (click)="markSolved(item)"
                      class="text-sm px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-medium transition-colors">
                ✓ Mark Solved
              </button>
            </div>
          </div>
        </div>

        <!-- Completed banner -->
        <div *ngIf="activeChallenge.completed"
             class="mt-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/25 rounded-xl px-5 py-4 flex items-center gap-4">
          <span class="text-3xl">🎉</span>
          <div>
            <p class="text-green-400 font-bold">{{ selectedDateKey === todayKey ? 'Challenge Complete!' : 'All solved that day!' }}</p>
            <p class="text-green-400/60 text-sm">Earned <strong>+{{ activeChallenge.score }} pts</strong>{{ selectedDateKey === todayKey ? ' · Come back tomorrow!' : '' }}</p>
          </div>
          <div class="ml-auto text-right">
            <p class="text-2xl font-bold text-green-400">+{{ activeChallenge.score }}</p>
            <p class="text-xs text-green-400/50">points</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact Calendar -->
    <div class="lg:col-span-1 bg-dark-800 border border-dark-700 rounded-2xl p-4 self-start">
      <div class="flex items-center justify-between mb-3">
        <button (click)="prevMonth()" class="w-7 h-7 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-400 hover:text-white transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <p class="text-white font-semibold text-sm">{{ calMonthLabel }}</p>
        <button (click)="nextMonth()" [disabled]="isCurrentDisplayMonth"
                class="w-7 h-7 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      <div class="grid grid-cols-7 mb-1">
        <div *ngFor="let d of ['S','M','T','W','T','F','S']"
             class="text-center text-xs font-medium text-dark-600 py-0.5">{{ d }}</div>
      </div>

      <div class="grid grid-cols-7 gap-0.5">
        <button *ngFor="let cell of calendarCells"
                (click)="selectDay(cell)"
                [disabled]="cell.status === 'future' || !cell.isCurrentMonth"
                class="relative rounded-lg text-xs font-medium flex items-center justify-center transition-all duration-150"
                style="aspect-ratio:1"
                [class]="getCellClass(cell)"
                [title]="cell.isCurrentMonth && cell.score > 0 ? (cell.score + ' pts') : ''">
          <span class="text-xs">{{ cell.isCurrentMonth ? cell.day : '' }}</span>
          <span *ngIf="cell.status === 'partial' && cell.isCurrentMonth"
                class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-400"></span>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 pt-3 border-t border-dark-700">
        <div class="flex items-center gap-1.5 text-xs text-dark-400">
          <span class="w-2.5 h-2.5 rounded-sm bg-green-500/70 shrink-0"></span>Done
        </div>
        <div class="flex items-center gap-1.5 text-xs text-dark-400">
          <span class="w-2.5 h-2.5 rounded-sm bg-yellow-500/50 shrink-0"></span>Partial
        </div>
        <div class="flex items-center gap-1.5 text-xs text-dark-400">
          <span class="w-2.5 h-2.5 rounded-sm bg-red-500/30 shrink-0"></span>Missed
        </div>
        <div class="flex items-center gap-1.5 text-xs text-dark-400">
          <span class="w-2.5 h-2.5 rounded-sm bg-dark-700 shrink-0"></span>None
        </div>
      </div>

      <div *ngIf="selectedDateKey !== todayKey" class="mt-3 pt-3 border-t border-dark-700 text-center">
        <p class="text-xs text-dark-400">Viewing <span class="text-primary-400 font-medium">{{ formatDate(selectedDateKey) }}</span></p>
        <button (click)="goToToday()" class="mt-1 text-xs text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors">
          Back to today
        </button>
      </div>
    </div>
  </div>

  <!-- Scoreboard -->
  <div class="bg-dark-800 border border-dark-700 rounded-2xl p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-white flex items-center gap-2">🏆 Scoreboard</h2>
      <span class="text-xs text-dark-500">{{ history.length }} days tracked</span>
    </div>
    <div *ngIf="history.length === 0" class="text-center py-10 text-dark-500 text-sm">
      Complete today's challenge to start your history!
    </div>
    <div *ngIf="history.length > 0" class="space-y-1.5">
      <div class="grid grid-cols-12 text-xs text-dark-500 font-medium px-3 pb-2 border-b border-dark-700">
        <span class="col-span-1">#</span>
        <span class="col-span-3">Date</span>
        <span class="col-span-4">Topics</span>
        <span class="col-span-2 text-center">Score</span>
        <span class="col-span-2 text-center">Status</span>
      </div>
      <div *ngFor="let entry of history; let i = index"
           (click)="jumpToDate(entry.date)"
           class="grid grid-cols-12 items-center px-3 py-2.5 rounded-xl hover:bg-dark-700/50 transition-colors text-sm cursor-pointer"
           [ngClass]="{'bg-primary-500/10 border border-primary-500/30': entry.date === selectedDateKey}">
        <div class="col-span-1">
          <span *ngIf="i === 0">🥇</span>
          <span *ngIf="i === 1">🥈</span>
          <span *ngIf="i === 2">🥉</span>
          <span *ngIf="i > 2" class="text-dark-500 text-xs">{{ i + 1 }}</span>
        </div>
        <div class="col-span-3">
          <p class="text-white font-medium text-sm">{{ formatDate(entry.date) }}</p>
          <p class="text-xs text-dark-500">{{ entry.date === todayKey ? 'Today' : daysAgo(entry.date) }}</p>
        </div>
        <div class="col-span-4">
          <div class="flex flex-wrap gap-1">
            <span *ngFor="let topic of entry.topicsRevised"
                  class="text-xs bg-primary-500/15 text-primary-400 px-2 py-0.5 rounded-full">{{ topic }}</span>
          </div>
        </div>
        <div class="col-span-2 text-center font-bold text-yellow-400 text-sm">+{{ entry.score }}</div>
        <div class="col-span-2 text-center">
          <span *ngIf="entry.completed" class="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">✓ Done</span>
          <span *ngIf="!entry.completed" class="text-xs bg-dark-600 text-dark-400 px-2 py-0.5 rounded-full font-medium">Partial</span>
        </div>
      </div>
    </div>
  </div>

</div>
  `
})
export class DailyChallengeComponent implements OnInit {
  challenge: DailyChallenge | null = null;
  loading = true;
  calYear = 0;
  calMonth = 0;
  calendarCells: CalendarDay[] = [];
  selectedDateKey = '';
  activeChallenge: DailyChallenge | null = null;
  history: ScoreEntry[] = [];
  stats = { totalScore: 0, currentStreak: 0, longestStreak: 0, daysCompleted: 0 };
  todayKey = '';
  todayLabel = '';

  constructor(private svc: DailyChallengeService) {}

  ngOnInit() {
    const now = new Date();
    this.todayKey = this.svc.todayKey();
    this.selectedDateKey = this.todayKey;
    this.todayLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    this.calYear = now.getFullYear();
    this.calMonth = now.getMonth();
    this.loadChallenge();
  }

  loadChallenge() {
    this.loading = true;
    this.svc.getTodayChallenge().subscribe({
      next: c => {
        this.challenge = c;
        this.activeChallenge = c;
        this.loading = false;
        this.refreshStats();
        this.buildCalendar();
      },
      error: () => { this.loading = false; this.buildCalendar(); }
    });
  }

  refreshStats() {
    this.stats = this.svc.getStats();
    this.history = this.svc.getHistory();
  }

  get calMonthLabel(): string {
    return new Date(this.calYear, this.calMonth, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  get isCurrentDisplayMonth(): boolean {
    const now = new Date();
    return this.calYear === now.getFullYear() && this.calMonth === now.getMonth();
  }

  prevMonth() {
    if (this.calMonth === 0) { this.calYear--; this.calMonth = 11; }
    else this.calMonth--;
    this.buildCalendar();
  }

  nextMonth() {
    if (this.isCurrentDisplayMonth) return;
    if (this.calMonth === 11) { this.calYear++; this.calMonth = 0; }
    else this.calMonth++;
    this.buildCalendar();
  }

  buildCalendar() {
    const store = this.svc.getStore();
    const today = this.todayKey;
    const firstDay = new Date(this.calYear, this.calMonth, 1);
    const lastDay  = new Date(this.calYear, this.calMonth + 1, 0);
    const cells: CalendarDay[] = [];
    const startDow = firstDay.getDay();
    for (let i = 0; i < startDow; i++) {
      cells.push({ date: '', day: 0, isCurrentMonth: false, isToday: false, status: 'none', score: 0 });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${this.calYear}-${String(this.calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === today;
      const isFuture = dateStr > today;
      let status: CalendarDay['status'] = 'none';
      let score = 0;
      if (!isFuture) {
        const ch = store.challenges[dateStr];
        if (ch) {
          score = ch.score;
          if (ch.completed) status = 'completed';
          else if (ch.questions.some(q => q.solved)) status = 'partial';
          else status = 'missed';
        } else if (dateStr < today) {
          status = 'missed';
        }
      } else {
        status = 'future';
      }
      cells.push({ date: dateStr, day: d, isCurrentMonth: true, isToday, status, score });
    }
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        cells.push({ date: '', day: 0, isCurrentMonth: false, isToday: false, status: 'none', score: 0 });
      }
    }
    this.calendarCells = cells;
  }

  getCellClass(cell: CalendarDay): string {
    if (!cell.isCurrentMonth) return 'opacity-0 cursor-default pointer-events-none';
    const base = 'cursor-pointer ';
    const sel = cell.date === this.selectedDateKey ? 'ring-2 ring-primary-500 ring-offset-1 ring-offset-dark-800 ' : '';
    const tod = cell.isToday ? 'font-bold ' : '';
    switch (cell.status) {
      case 'completed': return base + sel + tod + 'bg-green-500/70 text-white hover:bg-green-500/90';
      case 'partial':   return base + sel + tod + 'bg-yellow-500/40 text-yellow-200 hover:bg-yellow-500/60';
      case 'missed':    return base + sel + tod + 'bg-red-500/25 text-red-300 hover:bg-red-500/40';
      case 'future':    return 'cursor-default text-dark-600 bg-transparent';
      default:          return base + sel + tod + 'bg-dark-700 text-dark-300 hover:bg-dark-600';
    }
  }

  selectDay(cell: CalendarDay) {
    if (!cell.isCurrentMonth || cell.status === 'future' || !cell.date) return;
    this.selectedDateKey = cell.date;
    if (cell.date === this.todayKey) { this.activeChallenge = this.challenge; return; }
    const store = this.svc.getStore();
    this.activeChallenge = store.challenges[cell.date] ?? null;
  }

  goToToday() {
    const now = new Date();
    this.calYear = now.getFullYear();
    this.calMonth = now.getMonth();
    this.selectedDateKey = this.todayKey;
    this.activeChallenge = this.challenge;
    this.buildCalendar();
  }

  jumpToDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    this.calYear = d.getFullYear();
    this.calMonth = d.getMonth();
    this.buildCalendar();
    this.selectedDateKey = dateStr;
    if (dateStr === this.todayKey) { this.activeChallenge = this.challenge; }
    else { const store = this.svc.getStore(); this.activeChallenge = store.challenges[dateStr] ?? null; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get solvedCount(): number { return this.challenge?.questions.filter(q => q.solved).length ?? 0; }
  get activeSolvedCount(): number { return this.activeChallenge?.questions.filter(q => q.solved).length ?? 0; }
  get activeProgressPct(): number {
    if (!this.activeChallenge?.questions.length) return 0;
    return (this.activeSolvedCount / this.activeChallenge.questions.length) * 100;
  }

  markSolved(item: DailyChallengeQuestion) {
    this.challenge = this.svc.markSolved(item.question.id);
    this.activeChallenge = this.challenge;
    this.refreshStats();
    this.buildCalendar();
  }

  getScore(d: string): number { return ({ EASY: 10, MEDIUM: 20, HARD: 30 } as any)[d] ?? 10; }
  getDiffClass(d: string): string {
    return ({ EASY: 'bg-green-500/20 text-green-400', MEDIUM: 'bg-yellow-500/20 text-yellow-400', HARD: 'bg-red-500/20 text-red-400' } as any)[d] ?? '';
  }
  formatTime(iso: string): string { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  daysAgo(dateStr: string): string {
    const diff = Math.round((new Date(this.todayKey).getTime() - new Date(dateStr + 'T00:00:00').getTime()) / 86400000);
    return diff === 1 ? 'Yesterday' : diff + ' days ago';
  }
}

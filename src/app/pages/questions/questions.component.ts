import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Question, Topic, Tag, Difficulty, Status } from '../../core/models/models';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white">Questions</h1>
          <p class="text-dark-400 mt-1">{{ totalElements }} questions total</p>
        </div>
        <button (click)="openModal()" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Question
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-dark-800 border border-dark-700 rounded-2xl p-5 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-medium text-dark-400 mb-1.5">Search</label>
            <input [(ngModel)]="filters.keyword" (ngModelChange)="onFilterChange()" type="text" placeholder="Search questions..."
                   class="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"/>
          </div>
          <div>
            <label class="block text-xs font-medium text-dark-400 mb-1.5">Topic</label>
            <select [(ngModel)]="filters.topic" (ngModelChange)="onFilterChange()"
                    class="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors">
              <option [ngValue]="undefined">All Topics</option>
              <option *ngFor="let t of topics" [ngValue]="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-dark-400 mb-1.5">Difficulty</label>
            <select [(ngModel)]="filters.difficulty" (ngModelChange)="onFilterChange()"
                    class="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors">
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-dark-400 mb-1.5">Sort By</label>
            <select [(ngModel)]="sortBy" (ngModelChange)="load()"
                    class="w-full bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors">
              <option value="createdAt">Newest First</option>
              <option value="title">Title A-Z</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Questions List -->
      <div class="space-y-3">
        <div *ngFor="let q of questions"
             class="bg-dark-800 border border-dark-700 rounded-2xl p-5 hover:border-primary-500/40 transition-all duration-200 group">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-4 min-w-0 flex-1">
              <!-- Favorite -->
              <button (click)="toggleFavorite(q)" class="mt-0.5 shrink-0 transition-transform hover:scale-110">
                <svg class="w-5 h-5 transition-colors" [class]="q.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-dark-500 hover:text-yellow-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </button>
              <div class="min-w-0">
                <a [routerLink]="['/questions', q.id]" class="text-white font-semibold hover:text-primary-400 transition-colors line-clamp-1">{{ q.title }}</a>
                <div class="flex flex-wrap items-center gap-2 mt-2">
                  <span class="text-xs text-dark-400 bg-dark-700 px-2 py-0.5 rounded-lg">{{ q.topicName }}</span>
                  <span *ngFor="let tag of q.tags" class="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-lg">{{ tag.name }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs px-2.5 py-1 rounded-full font-medium" [class]="getDiffClass(q.difficulty)">{{ q.difficulty }}</span>
              <select [(ngModel)]="q.status" (ngModelChange)="updateStatus(q)"
                      class="text-xs px-2.5 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
                      [class]="getStatusClass(q.status)">
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <button (click)="editQuestion(q)" class="p-1.5 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button (click)="deleteQuestion(q.id)" class="p-1.5 rounded-lg hover:bg-red-500/20 text-dark-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="questions.length === 0 && !loading" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <p class="text-dark-400 text-lg font-medium">No questions found</p>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
        <button (click)="changePage(currentPage - 1)" [disabled]="currentPage === 0"
                class="px-4 py-2 rounded-xl bg-dark-800 border border-dark-700 text-dark-300 hover:text-white hover:border-dark-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          ← Prev
        </button>
        <span class="text-dark-400 text-sm px-4">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
        <button (click)="changePage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1"
                class="px-4 py-2 rounded-xl bg-dark-800 border border-dark-700 text-dark-300 hover:text-white hover:border-dark-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          Next →
        </button>
      </div>

      <!-- Add/Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeModal()"></div>
        <div class="relative bg-dark-800 border border-dark-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-up my-4">
          <h2 class="text-xl font-bold text-white mb-5">{{ editingQuestion ? 'Edit Question' : 'New Question' }}</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-1.5">Title *</label>
              <input [(ngModel)]="form.title" type="text" placeholder="Question title"
                     class="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
              <textarea [(ngModel)]="form.description" rows="3" placeholder="Problem description..."
                        class="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-dark-300 mb-1.5">Topic *</label>
                <select [(ngModel)]="form.topicId" class="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors">
                  <option [ngValue]="0" disabled>Select topic</option>
                  <option *ngFor="let t of topics" [ngValue]="t.id">{{ t.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-dark-300 mb-1.5">Difficulty *</label>
                <select [(ngModel)]="form.difficulty" class="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors">
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-dark-300 mb-1.5">Status</label>
                <select [(ngModel)]="form.status" class="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors">
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div class="flex items-end pb-1">
                <label class="flex items-center gap-3 cursor-pointer">
                  <div class="relative">
                    <input type="checkbox" [(ngModel)]="form.isFavorite" class="sr-only peer"/>
                    <div class="w-10 h-6 bg-dark-600 peer-checked:bg-primary-600 rounded-full transition-colors"></div>
                    <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                  <span class="text-sm text-dark-300">Favorite</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-dark-300 mb-1.5">Tags</label>
              <div class="flex flex-wrap gap-2">
                <button *ngFor="let tag of allTags" (click)="toggleTag(tag.id)"
                        class="text-xs px-3 py-1.5 rounded-full border transition-all"
                        [class]="form.tagIds.includes(tag.id) ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-dark-700 border-dark-600 text-dark-400 hover:border-dark-500'">
                  {{ tag.name }}
                </button>
              </div>
            </div>
          </div>
          <div *ngIf="error" class="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{{ error }}</div>
          <div class="flex gap-3 mt-6">
            <button (click)="closeModal()" class="flex-1 px-4 py-2.5 rounded-xl border border-dark-600 text-dark-300 hover:text-white transition-colors">Cancel</button>
            <button (click)="saveQuestion()" class="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors">
              {{ editingQuestion ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class QuestionsComponent implements OnInit {
  questions: Question[] = [];
  topics: Topic[] = [];
  allTags: Tag[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  loading = false;
  sortBy = 'createdAt';

  filters: { keyword?: string; topic?: number; difficulty?: string } = {};

  showModal = false;
  editingQuestion: Question | null = null;
  error = '';

  form = this.emptyForm();

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['topic']) this.filters.topic = +params['topic'];
      this.load();
    });
    this.api.getTopics().subscribe(t => this.topics = t);
    this.api.getTags().subscribe(t => this.allTags = t);
  }

  emptyForm() {
    return { title: '', description: '', difficulty: 'MEDIUM' as Difficulty, status: 'NOT_STARTED' as Status, isFavorite: false, topicId: 0, tagIds: [] as number[] };
  }

  load() {
    this.loading = true;
    const hasFilter = this.filters.keyword || this.filters.topic || this.filters.difficulty;
    const obs = hasFilter
      ? this.api.searchQuestions(this.filters, this.currentPage)
      : this.api.getQuestions(this.currentPage, 10, this.sortBy);
    obs.subscribe(r => {
      this.questions = r.content;
      this.totalElements = r.totalElements;
      this.totalPages = r.totalPages;
      this.loading = false;
    });
  }

  onFilterChange() { this.currentPage = 0; this.load(); }
  changePage(p: number) { this.currentPage = p; this.load(); }

  openModal() { this.showModal = true; this.editingQuestion = null; this.form = this.emptyForm(); this.error = ''; }
  closeModal() { this.showModal = false; this.error = ''; }

  editQuestion(q: Question) {
    this.editingQuestion = q;
    this.form = { title: q.title, description: q.description, difficulty: q.difficulty, status: q.status, isFavorite: q.isFavorite, topicId: q.topicId, tagIds: q.tags.map(t => t.id) };
    this.showModal = true;
    this.error = '';
  }

  toggleTag(id: number) {
    const idx = this.form.tagIds.indexOf(id);
    idx >= 0 ? this.form.tagIds.splice(idx, 1) : this.form.tagIds.push(id);
  }

  saveQuestion() {
    if (!this.form.title.trim() || !this.form.topicId) { this.error = 'Title and topic are required'; return; }
    const obs = this.editingQuestion
      ? this.api.updateQuestion(this.editingQuestion.id, this.form)
      : this.api.createQuestion(this.form);
    obs.subscribe({ next: () => { this.closeModal(); this.load(); }, error: e => this.error = e.error?.message || 'Something went wrong' });
  }

  toggleFavorite(q: Question) {
    this.api.updateQuestion(q.id, { ...q, topicId: q.topicId, tagIds: q.tags.map(t => t.id), isFavorite: !q.isFavorite })
      .subscribe(() => q.isFavorite = !q.isFavorite);
  }

  updateStatus(q: Question) {
    this.api.updateQuestion(q.id, { title: q.title, description: q.description, difficulty: q.difficulty, status: q.status, isFavorite: q.isFavorite, topicId: q.topicId, tagIds: q.tags.map(t => t.id) }).subscribe();
  }

  deleteQuestion(id: number) {
    if (!confirm('Delete this question?')) return;
    this.api.deleteQuestion(id).subscribe(() => this.load());
  }

  getDiffClass(d: string) {
    return { EASY: 'bg-green-500/20 text-green-400', MEDIUM: 'bg-yellow-500/20 text-yellow-400', HARD: 'bg-red-500/20 text-red-400' }[d] ?? '';
  }
  getStatusClass(s: string) {
    return { COMPLETED: 'bg-green-500/20 text-green-400', IN_PROGRESS: 'bg-blue-500/20 text-blue-400', NOT_STARTED: 'bg-dark-600 text-dark-400' }[s] ?? '';
  }
}

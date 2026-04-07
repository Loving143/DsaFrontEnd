import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Question, Answer, Note } from '../../core/models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in" *ngIf="question">

      <!-- Back -->
      <a routerLink="/questions" class="inline-flex items-center gap-2 text-dark-400 hover:text-white text-sm mb-6 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Back to Questions
      </a>

      <!-- Question Header -->
      <div class="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <h1 class="text-2xl font-bold text-white">{{ question.title }}</h1>
          <button (click)="toggleFavorite()" class="shrink-0 transition-transform hover:scale-110">
            <svg class="w-6 h-6 transition-colors" [class]="question.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-dark-500 hover:text-yellow-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-3 mb-4">
          <span class="text-sm px-3 py-1 rounded-full font-medium" [class]="getDiffClass(question.difficulty)">{{ question.difficulty }}</span>
          <span class="text-sm bg-dark-700 text-dark-300 px-3 py-1 rounded-full">{{ question.topicName }}</span>
          <span *ngFor="let tag of question.tags" class="text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">{{ tag.name }}</span>
        </div>

        <!-- Status Selector -->
        <div class="flex items-center gap-3">
          <span class="text-sm text-dark-400">Status:</span>
          <div class="flex gap-2">
            <button *ngFor="let s of statuses" (click)="updateStatus(s.value)"
                    class="text-xs px-3 py-1.5 rounded-full font-medium border transition-all"
                    [class]="question.status === s.value ? s.activeClass : 'bg-dark-700 border-dark-600 text-dark-400 hover:border-dark-500'">
              {{ s.label }}
            </button>
          </div>
        </div>

        <p *ngIf="question.description" class="mt-4 text-dark-300 leading-relaxed">{{ question.description }}</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-dark-800 border border-dark-700 rounded-xl p-1 mb-6 w-fit">
        <button *ngFor="let tab of tabs" (click)="activeTab = tab.key"
                class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
                [class]="activeTab === tab.key ? 'bg-primary-600 text-white shadow-lg' : 'text-dark-400 hover:text-white'">
          {{ tab.label }}
          <span class="ml-1.5 text-xs opacity-70">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Answers Tab -->
      <div *ngIf="activeTab === 'answers'" class="space-y-4 animate-fade-in">
        <div *ngFor="let answer of answers" class="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden group">
          <div class="flex items-center justify-between px-5 py-3 border-b border-dark-700 bg-dark-700/50">
            <span class="text-xs font-medium text-dark-400 font-mono">Solution</span>
            <button (click)="deleteAnswer(answer.id)" class="p-1 rounded hover:bg-red-500/20 text-dark-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
          <pre class="p-5 text-sm text-green-300 font-mono overflow-x-auto bg-dark-900/50 leading-relaxed">{{ answer.code }}</pre>
          <div *ngIf="answer.explanation" class="px-5 py-4 border-t border-dark-700">
            <p class="text-sm text-dark-300 leading-relaxed">{{ answer.explanation }}</p>
          </div>
        </div>

        <!-- Add Answer Form -->
        <div class="bg-dark-800 border border-dark-700 rounded-2xl p-5">
          <h3 class="text-sm font-semibold text-white mb-4">Add Solution</h3>
          <textarea [(ngModel)]="newAnswer.code" rows="6" placeholder="Paste your code here..."
                    class="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-3 text-green-300 font-mono text-sm placeholder-dark-600 focus:outline-none focus:border-primary-500 transition-colors resize-none mb-3"></textarea>
          <textarea [(ngModel)]="newAnswer.explanation" rows="2" placeholder="Explanation (optional)..."
                    class="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors resize-none mb-3"></textarea>
          <button (click)="addAnswer()" [disabled]="!newAnswer.code.trim()"
                  class="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Add Solution
          </button>
        </div>
      </div>

      <!-- Notes Tab -->
      <div *ngIf="activeTab === 'notes'" class="space-y-4 animate-fade-in">
        <div *ngFor="let note of notes" class="bg-dark-800 border border-dark-700 rounded-2xl p-5 group">
          <div class="flex items-start justify-between gap-4">
            <p class="text-dark-200 leading-relaxed text-sm flex-1">{{ note.content }}</p>
            <button (click)="deleteNote(note.id)" class="p-1 rounded hover:bg-red-500/20 text-dark-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
          <p class="text-xs text-dark-500 mt-2">{{ note.createdAt | date:'MMM d, y' }}</p>
        </div>

        <!-- Add Note -->
        <div class="bg-dark-800 border border-dark-700 rounded-2xl p-5">
          <h3 class="text-sm font-semibold text-white mb-4">Add Note</h3>
          <textarea [(ngModel)]="newNote" rows="3" placeholder="Write your note..."
                    class="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors resize-none mb-3"></textarea>
          <button (click)="addNote()" [disabled]="!newNote.trim()"
                  class="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Add Note
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div *ngIf="!question" class="flex items-center justify-center min-h-96">
      <div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  `
})
export class QuestionDetailComponent implements OnInit {
  question: Question | null = null;
  answers: Answer[] = [];
  notes: Note[] = [];
  activeTab = 'answers';
  newAnswer = { code: '', explanation: '' };
  newNote = '';

  statuses = [
    { value: 'NOT_STARTED', label: 'Not Started', activeClass: 'bg-dark-600 border-dark-500 text-white' },
    { value: 'IN_PROGRESS', label: 'In Progress', activeClass: 'bg-blue-500/20 border-blue-500/50 text-blue-400' },
    { value: 'COMPLETED', label: 'Completed', activeClass: 'bg-green-500/20 border-green-500/50 text-green-400' },
  ];

  get tabs() {
    return [
      { key: 'answers', label: 'Solutions', count: this.answers.length },
      { key: 'notes', label: 'Notes', count: this.notes.length },
    ];
  }

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      question: this.api.getQuestion(id),
      answers: this.api.getAnswers(id),
      notes: this.api.getNotes(id)
    }).subscribe(({ question, answers, notes }) => {
      this.question = question;
      this.answers = answers;
      this.notes = notes;
    });
  }

  toggleFavorite() {
    if (!this.question) return;
    this.api.updateQuestion(this.question.id, { ...this.question, topicId: this.question.topicId, tagIds: this.question.tags.map(t => t.id), isFavorite: !this.question.isFavorite })
      .subscribe(q => this.question = q);
  }

  updateStatus(status: string) {
    if (!this.question) return;
    this.api.updateQuestion(this.question.id, { ...this.question, topicId: this.question.topicId, tagIds: this.question.tags.map(t => t.id), status: status as any })
      .subscribe(q => this.question = q);
  }

  addAnswer() {
    if (!this.question || !this.newAnswer.code.trim()) return;
    this.api.addAnswer(this.question.id, this.newAnswer).subscribe(a => {
      this.answers.push(a);
      this.newAnswer = { code: '', explanation: '' };
    });
  }

  deleteAnswer(id: number) {
    if (!this.question || !confirm('Delete this solution?')) return;
    this.api.deleteAnswer(this.question.id, id).subscribe(() => {
      this.answers = this.answers.filter(a => a.id !== id);
    });
  }

  addNote() {
    if (!this.question || !this.newNote.trim()) return;
    this.api.addNote(this.question.id, { content: this.newNote }).subscribe(n => {
      this.notes.push(n);
      this.newNote = '';
    });
  }

  deleteNote(id: number) {
    if (!this.question || !confirm('Delete this note?')) return;
    this.api.deleteNote(this.question.id, id).subscribe(() => {
      this.notes = this.notes.filter(n => n.id !== id);
    });
  }

  getDiffClass(d: string) {
    return { EASY: 'bg-green-500/20 text-green-400', MEDIUM: 'bg-yellow-500/20 text-yellow-400', HARD: 'bg-red-500/20 text-red-400' }[d] ?? '';
  }
}

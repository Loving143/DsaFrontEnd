import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Topic } from '../../core/models/models';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white">Topics</h1>
          <p class="text-dark-400 mt-1">Organize your DSA practice by topic</p>
        </div>
        <button (click)="openModal()" class="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          New Topic
        </button>
      </div>

      <!-- Topics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <div *ngFor="let topic of topics"
             class="bg-dark-800 border border-dark-700 rounded-2xl p-6 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 group">
          <div class="flex items-start justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-700/20 border border-primary-500/30 flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="editTopic(topic)" class="p-1.5 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button (click)="deleteTopic(topic.id)" class="p-1.5 rounded-lg hover:bg-red-500/20 text-dark-400 hover:text-red-400 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
          <h3 class="text-white font-semibold text-lg mb-1 group-hover:text-primary-400 transition-colors">{{ topic.name }}</h3>
          <p class="text-dark-400 text-sm mb-4">{{ topic.questionCount }} question{{ topic.questionCount !== 1 ? 's' : '' }}</p>
          <a [routerLink]="['/topics', topic.id, 'questions']"
             class="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors">
            View questions →
          </a>
        </div>

        <!-- Empty state -->
        <div *ngIf="topics.length === 0" class="col-span-full flex flex-col items-center justify-center py-20 text-center">
          <div class="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <p class="text-dark-400 text-lg font-medium">No topics yet</p>
          <p class="text-dark-500 text-sm mt-1">Create your first topic to get started</p>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeModal()"></div>
        <div class="relative bg-dark-800 border border-dark-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
          <h2 class="text-xl font-bold text-white mb-5">{{ editingTopic ? 'Edit Topic' : 'New Topic' }}</h2>
          <div class="mb-5">
            <label class="block text-sm font-medium text-dark-300 mb-2">Topic Name</label>
            <input [(ngModel)]="topicName" type="text" placeholder="e.g. Two Pointers"
                   class="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors" />
          </div>
          <div *ngIf="error" class="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{{ error }}</div>
          <div class="flex gap-3">
            <button (click)="closeModal()" class="flex-1 px-4 py-2.5 rounded-xl border border-dark-600 text-dark-300 hover:text-white hover:border-dark-500 transition-colors">Cancel</button>
            <button (click)="saveTopic()" [disabled]="!topicName.trim()"
                    class="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {{ editingTopic ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TopicsComponent implements OnInit {
  topics: Topic[] = [];
  showModal = false;
  topicName = '';
  editingTopic: Topic | null = null;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getTopics().subscribe(t => this.topics = t);
  }

  openModal() { this.showModal = true; this.topicName = ''; this.editingTopic = null; this.error = ''; }
  closeModal() { this.showModal = false; this.error = ''; }

  editTopic(topic: Topic) {
    this.editingTopic = topic;
    this.topicName = topic.name;
    this.showModal = true;
    this.error = '';
  }

  saveTopic() {
    if (!this.topicName.trim()) return;
    const req = { name: this.topicName.trim() };
    const obs = this.editingTopic
      ? this.api.updateTopic(this.editingTopic.id, req)
      : this.api.createTopic(req);
    obs.subscribe({ next: () => { this.closeModal(); this.load(); }, error: e => this.error = e.error?.message || 'Something went wrong' });
  }

  deleteTopic(id: number) {
    if (!confirm('Delete this topic? All questions under it will also be removed.')) return;
    this.api.deleteTopic(id).subscribe(() => this.load());
  }
}

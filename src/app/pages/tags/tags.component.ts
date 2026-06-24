import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Tag } from '../../core/models/models';

const TAG_COLORS = [
  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-green-500/20 text-green-400 border-green-500/30',
  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'bg-red-500/20 text-red-400 border-red-500/30',
  'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'bg-teal-500/20 text-teal-400 border-teal-500/30',
];

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white">Tags</h1>
          <p class="text-dark-400 mt-1">Label your questions for quick filtering</p>
        </div>
      </div>

      <!-- Add Tag -->
      <div class="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-8">
        <h2 class="text-sm font-semibold text-white mb-4">Create New Tag</h2>
        <div class="flex gap-3">
          <input [(ngModel)]="newTagName" type="text" placeholder="e.g. Must-Do, Revision, Important..."
                 (keyup.enter)="createTag()"
                 class="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"/>
          <button (click)="createTag()" [disabled]="!newTagName.trim()"
                  class="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Create
          </button>
        </div>
        <div *ngIf="error" class="mt-3 text-sm text-red-400">{{ error }}</div>
      </div>

      <!-- Tags Grid -->
      <div class="flex flex-wrap gap-3">
        <div *ngFor="let tag of tags; let i = index"
             class="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm group transition-all hover:scale-105"
             [class]="getColor(i)">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          {{ tag.name }}
          <button (click)="deleteTag(tag.id)" class="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div *ngIf="tags.length === 0" class="w-full text-center py-16 text-dark-500">
          No tags yet. Create some to label your questions.
        </div>
      </div>
    </div>
  `
})
export class TagsComponent implements OnInit {
  tags: Tag[] = [];
  newTagName = '';
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() { this.api.getTags().subscribe(t => this.tags = t); }

  createTag() {
    if (!this.newTagName.trim()) return;
    this.api.createTag({ name: this.newTagName.trim() }).subscribe({
      next: () => { this.newTagName = ''; this.error = ''; this.load(); },
      error: e => this.error = e.error?.message || 'Tag already exists'
    });
  }

  deleteTag(id: number) {
    if (!confirm('Delete this tag?')) return;
    this.api.deleteTag(id).subscribe(() => this.load());
  }

  getColor(i: number) { return TAG_COLORS[i % TAG_COLORS.length]; }
}

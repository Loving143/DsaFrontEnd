import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Question, Topic,
  DailyChallenge, DailyChallengeQuestion,
  ChallengeStore, ScoreEntry
} from '../models/models';

const STORE_KEY = 'dsa_challenge_store';

const SCORE_MAP: Record<string, number> = {
  EASY: 10,
  MEDIUM: 20,
  HARD: 30,
};

@Injectable({ providedIn: 'root' })
export class DailyChallengeService {

  constructor(private api: ApiService) {}

  // ── Store helpers ────────────────────────────────────────────────────────

  getStore(): ChallengeStore {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch { /* fall through */ }
    }
    return { challenges: {}, totalScore: 0, currentStreak: 0, longestStreak: 0, history: [] };
  }

  private saveStore(store: ChallengeStore): void {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  todayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ── Daily challenge ───────────────────────────────────────────────────────

  /** Returns today's challenge — creates one if it doesn't exist yet */
  getTodayChallenge(): Observable<DailyChallenge> {
    const store = this.getStore();
    const today = this.todayKey();

    if (store.challenges[today]) {
      return of(store.challenges[today]);
    }

    // Need to create a new challenge
    return this.api.getTopics().pipe(
      switchMap(topics => {
        if (!topics.length) return of(null as any);

        // Pick 3 distinct random topics (or fewer if not enough topics)
        const shuffledTopics = this.shuffleArray([...topics]);
        const picked = shuffledTopics.slice(0, Math.min(3, shuffledTopics.length));

        // Fetch questions for each picked topic
        return forkJoin(
          picked.map(t => this.api.getTopicQuestions(t.id, 0, 100))
        ).pipe(
          map(responses => {
            const challengeQuestions: DailyChallengeQuestion[] = [];

            responses.forEach((resp, idx) => {
              const pool = resp.content;
              if (!pool.length) return;
              // Pick one deterministic-random question per topic based on today's date
              const seed = this.dateSeed(today) + idx * 7919;
              const q = pool[seed % pool.length];
              challengeQuestions.push({ question: q, solved: false });
            });

            // If we got fewer than 3, fill from any topic
            if (challengeQuestions.length < 3) {
              const allQ = responses.flatMap(r => r.content);
              const used = new Set(challengeQuestions.map(c => c.question.id));
              const extras = this.shuffleArray(allQ.filter(q => !used.has(q.id)));
              while (challengeQuestions.length < 3 && extras.length) {
                const q = extras.shift()!;
                challengeQuestions.push({ question: q, solved: false });
              }
            }

            const challenge: DailyChallenge = {
              date: today,
              questions: challengeQuestions.slice(0, 3),
              completed: false,
              score: 0,
            };

            store.challenges[today] = challenge;
            this.saveStore(store);
            return challenge;
          })
        );
      })
    );
  }

  /** Mark a question as solved; updates score & streak if all 3 done */
  markSolved(questionId: number): DailyChallenge {
    const store = this.getStore();
    const today = this.todayKey();
    const challenge = store.challenges[today];
    if (!challenge) return challenge;

    const item = challenge.questions.find(q => q.question.id === questionId);
    if (!item || item.solved) return challenge;

    item.solved = true;
    item.solvedAt = new Date().toISOString();

    // Score for this question
    const pts = SCORE_MAP[item.question.difficulty] ?? 10;
    challenge.score += pts;
    store.totalScore += pts;

    // Check if all 3 solved
    if (challenge.questions.every(q => q.solved)) {
      challenge.completed = true;

      // Build history entry
      const entry: ScoreEntry = {
        date: today,
        score: challenge.score,
        completed: true,
        topicsRevised: [...new Set(challenge.questions.map(q => q.question.topicName))],
      };

      // Update or add history entry
      const hi = store.history.findIndex(h => h.date === today);
      if (hi >= 0) store.history[hi] = entry;
      else store.history.unshift(entry);

      // Recalculate streak
      this.recalcStreak(store);
    }

    store.challenges[today] = challenge;
    this.saveStore(store);
    return challenge;
  }

  /** Full scoreboard history sorted newest first */
  getHistory(): ScoreEntry[] {
    return this.getStore().history.sort((a, b) => b.date.localeCompare(a.date));
  }

  getStats() {
    const store = this.getStore();
    const completed = store.history.filter(h => h.completed).length;
    return {
      totalScore: store.totalScore,
      currentStreak: store.currentStreak,
      longestStreak: store.longestStreak,
      daysCompleted: completed,
    };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private dateSeed(dateStr: string): number {
    // Turn 'YYYY-MM-DD' into a stable integer
    return parseInt(dateStr.replace(/-/g, ''), 10);
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private recalcStreak(store: ChallengeStore): void {
    const completedDates = store.history
      .filter(h => h.completed)
      .map(h => h.date)
      .sort((a, b) => b.localeCompare(a)); // newest first

    if (!completedDates.length) { store.currentStreak = 0; return; }

    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (const d of completedDates) {
      const dayStr = cursor.toISOString().split('T')[0];
      if (d === dayStr) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    store.currentStreak = streak;
    store.longestStreak = Math.max(store.longestStreak, streak);
  }
}

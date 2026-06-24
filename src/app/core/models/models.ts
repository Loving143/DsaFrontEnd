export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface Topic {
  id: number;
  name: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  status: Status;
  isFavorite: boolean;
  topicId: number;
  topicName: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: number;
  code: string;
  explanation: string;
  questionId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  content: string;
  questionId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface TopicRequest { name: string; }
export interface QuestionRequest {
  title: string;
  description: string;
  difficulty: Difficulty;
  status: Status;
  isFavorite: boolean;
  topicId: number;
  tagIds: number[];
}
export interface AnswerRequest { code: string; explanation: string; }
export interface NoteRequest { content: string; }
export interface TagRequest { name: string; }

// ── Daily Challenge ───────────────────────────────────────────────────────────

export interface DailyChallenge {
  date: string;           // 'YYYY-MM-DD'
  questions: DailyChallengeQuestion[];
  completed: boolean;     // true when all 3 solved
  score: number;          // points earned today (0 | 30 | 60 | 90 ... based on difficulty)
}

export interface DailyChallengeQuestion {
  question: Question;
  solved: boolean;
  solvedAt?: string;
}

export interface ScoreEntry {
  date: string;
  score: number;
  completed: boolean;
  topicsRevised: string[];
}

export interface ChallengeStore {
  challenges: Record<string, DailyChallenge>;  // keyed by date
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  history: ScoreEntry[];
}

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

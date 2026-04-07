import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Topic, TopicRequest, Question, QuestionRequest,
  Answer, AnswerRequest, Note, NoteRequest,
  Tag, TagRequest, PagedResponse
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:85';

  constructor(private http: HttpClient) {}

  // Topics
  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.base}/topics`);
  }
  getTopic(id: number): Observable<Topic> {
    return this.http.get<Topic>(`${this.base}/topics/${id}`);
  }
  createTopic(body: TopicRequest): Observable<Topic> {
    return this.http.post<Topic>(`${this.base}/topics`, body);
  }
  updateTopic(id: number, body: TopicRequest): Observable<Topic> {
    return this.http.put<Topic>(`${this.base}/topics/${id}`, body);
  }
  deleteTopic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/topics/${id}`);
  }
  getTopicQuestions(id: number, page = 0, size = 20): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.base}/topics/${id}/questions`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  // Questions
  getQuestions(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Observable<PagedResponse<Question>> {
    const params = new HttpParams()
      .set('page', page).set('size', size)
      .set('sortBy', sortBy).set('sortDir', sortDir);
    return this.http.get<PagedResponse<Question>>(`${this.base}/questions`, { params });
  }
  getQuestion(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.base}/questions/${id}`);
  }
  createQuestion(body: QuestionRequest): Observable<Question> {
    return this.http.post<Question>(`${this.base}/questions`, body);
  }
  updateQuestion(id: number, body: QuestionRequest): Observable<Question> {
    return this.http.put<Question>(`${this.base}/questions/${id}`, body);
  }
  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/questions/${id}`);
  }
  searchQuestions(filters: { topic?: number; difficulty?: string; keyword?: string }, page = 0, size = 10): Observable<PagedResponse<Question>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters.topic) params = params.set('topic', filters.topic);
    if (filters.difficulty) params = params.set('difficulty', filters.difficulty);
    if (filters.keyword) params = params.set('keyword', filters.keyword);
    return this.http.get<PagedResponse<Question>>(`${this.base}/questions/search`, { params });
  }

  // Answers
  getAnswers(questionId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.base}/questions/${questionId}/answers`);
  }
  addAnswer(questionId: number, body: AnswerRequest): Observable<Answer> {
    return this.http.post<Answer>(`${this.base}/questions/${questionId}/answers`, body);
  }
  deleteAnswer(questionId: number, answerId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/questions/${questionId}/answers/${answerId}`);
  }

  // Notes
  getNotes(questionId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.base}/questions/${questionId}/notes`);
  }
  addNote(questionId: number, body: NoteRequest): Observable<Note> {
    return this.http.post<Note>(`${this.base}/questions/${questionId}/notes`, body);
  }
  deleteNote(questionId: number, noteId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/questions/${questionId}/notes/${noteId}`);
  }

  // Tags
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.base}/tags`);
  }
  createTag(body: TagRequest): Observable<Tag> {
    return this.http.post<Tag>(`${this.base}/tags`, body);
  }
  deleteTag(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/tags/${id}`);
  }
}

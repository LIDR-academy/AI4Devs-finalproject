import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MessageTemplate {
  id: string;
  category: string;
  name: string;
  defaultMessage: string;
  customMessage?: string;
  iconIdentifier: string;
  isEnabled: boolean;
}

export interface LiveMessage {
  id: string;
  content: string;
  sentAt: string;
  deliveryStatus: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class LiveMessageService {
  private http = inject(HttpClient);
  
  getTemplates(slug: string): Observable<MessageTemplate[]> {
    return this.http.get<MessageTemplate[]>(`${environment.apiBaseUrl}/events/${slug}/message-templates`);
  }

  getLiveMessages(slug: string): Observable<LiveMessage[]> {
    return this.http.get<LiveMessage[]>(`${environment.apiBaseUrl}/events/${slug}/live-messages`);
  }

  sendLiveMessage(slug: string, content: string, category: string): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}/live/${slug}/send`, { content, category });
  }
}

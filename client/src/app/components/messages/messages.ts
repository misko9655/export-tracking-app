import { Component, inject } from '@angular/core';
import { MessagesService } from '../../services/messages.service';

@Component({
  selector: 'app-messages',
  imports: [],
  template: '',
})
export class Messages {
  messagesService = inject(MessagesService);
}

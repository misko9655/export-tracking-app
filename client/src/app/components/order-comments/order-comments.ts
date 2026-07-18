import { Component, computed, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Order, OrderComment } from '../../models/order.model';
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../services/messages.service';
import { isHandledAuthError } from '../../services/error.interceptor';

@Component({
  selector: 'app-order-comments',
  standalone: true,
  imports: [FormsModule, DatePipe, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule],
  templateUrl: './order-comments.html',
  styleUrl: './order-comments.scss',
})
export class OrderComments {
  orderId = input.required<string>();
  comments = input<OrderComment[]>([]);
  commentAdded = output<Order>();
  commentDeleted = output<Order>();

  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);
  private messagesService = inject(MessagesService);

  listRef = viewChild<ElementRef<HTMLDivElement>>('commentsList');
  newText = signal('');
  submitting = signal(false);

  currentUsername = () => this.authService.user()?.username ?? '';
  isViewer = computed(() => this.authService.user()?.roles[0] === 'VIEWER');

  constructor() {
    effect(() => {
      this.comments();
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  private scrollToBottom() {
    const el = this.listRef()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  isOwn(comment: OrderComment): boolean {
    return comment.username === this.currentUsername();
  }

  async submit() {
    const text = this.newText().trim();
    if (!text) return;
    const user = this.authService.user();
    if (!user) return;

    this.submitting.set(true);
    try {
      const updated = await this.ordersService.addComment(
        this.orderId(), text, user.username
      );
      this.newText.set('');
      this.commentAdded.emit(updated);
    } catch (error) {
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Greška pri dodavanju komentara.', 'error');
      }
    } finally {
      this.submitting.set(false);
    }
  }

  async remove(commentId: string) {
    try {
      const updated = await this.ordersService.deleteComment(this.orderId(), commentId);
      this.commentDeleted.emit(updated);
    } catch (error) {
      if (!isHandledAuthError(error)) {
        this.messagesService.showMessage('Greška pri brisanju komentara.', 'error');
      }
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

interface Toast {
  id: number;
  title: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  activeTab: 'signin' | 'signup' | 'forgot' = 'signin';
  email = '';
  password = '';
  regName = '';
  regEmail = '';
  regPassword = '';
  termsAccepted = false;
  recEmail = '';
  passwordVisible = false;
  regPasswordVisible = false;
  isSubmitting = false;
  toasts: Toast[] = [];
  private nextToastId = 0;

  switchTab(tab: 'signin' | 'signup' | 'forgot') {
    this.activeTab = tab;
    this.passwordVisible = false;
    this.regPasswordVisible = false;
  }

  autofill(email: string, pass: string) {
    this.switchTab('signin');
    this.email = email;
    this.password = pass;
    this.showToast('Success', 'Credentials autofilled! Click Sign In to continue.', 'success');
  }

  showToast(title: string, text: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = this.nextToastId++;
    this.toasts.push({ id, title, text, type });

    setTimeout(() => {
      this.removeToast(id);
    }, 5000);
  }

  removeToast(id: number) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
  }

  handleLoginSubmit(event: Event) {
    event.preventDefault();
    if (!this.email || !this.password) return;

    this.isSubmitting = true;

    setTimeout(() => {
      this.isSubmitting = false;
      if (this.password.length >= 6) {
        this.showToast('Session Initiated', `Logged in as ${this.email}.`, 'success');
      } else {
        this.showToast('Authentication Failed', 'Password is too short.', 'error');
      }
    }, 1000);
  }

  handleRegisterSubmit(event: Event) {
    event.preventDefault();
    if (!this.regName || !this.regEmail || !this.regPassword) return;

    this.showToast('Account Created', `Welcome ${this.regName}!`, 'success');
    setTimeout(() => {
      this.switchTab('signin');
      this.email = this.regEmail;
    }, 500);
  }

  handleRecoverySubmit(event: Event) {
    event.preventDefault();
    if (!this.recEmail) return;

    this.showToast('Token Dispatched', `Recovery link sent to ${this.recEmail}.`, 'success');
  }

  handleSocialLogin(provider: string) {
    this.showToast('Handshaking', `Connecting with ${provider}...`, 'info');
    setTimeout(() => {
      this.showToast('Integration Active', `Signed in with ${provider}.`, 'success');
    }, 800);
  }
}

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

  dataApiKey = '';
  dataActionId = 'angular-auth';
  dataEmailElement = 'email';

  private generateApiKey(length = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private generateSessionId(length = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

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

  injectCdnScript(userEmail: string) {
    if (typeof window === 'undefined') return;

    if (document.getElementById('botbuster-script')) {
      console.log('CDN script already injected.');
      return;
    }

    this.dataApiKey = this.generateApiKey();
    const sessionId = this.generateSessionId();
    const currentURL = 'http://localhost:4200/';
    const injectedEmail = 'tarunjajoria95@gmail.com';
    const script = document.createElement('script');
    script.id = 'botbuster-script';
    script.src = 'https://cdn.jsdelivr.net/gh/tarunInomatrix/captcha-script@bc3e2cb74bf9967ea2b0ea1309e007f84b0149f7/quick-check-inject.js';
    script.async = true;
    script.setAttribute('data-api-key','3ee57ddd-2946-449a-9908-8a28d7ce3960');
    script.setAttribute('data-email', injectedEmail);
    script.setAttribute('data-loaded-captcha-url', currentURL);
    script.setAttribute('data-action-id', this.dataActionId);
    script.setAttribute('data-email-element', this.dataEmailElement);
    script.setAttribute('data-web-url', currentURL);
    script.setAttribute('data-device-type', 'desktop');
    script.setAttribute('data-session-id', sessionId);

    document.body.appendChild(script);

    script.onload = () => {
      console.log('Botbuster CDN script loaded successfully and should inject.');
    };

    script.onerror = () => {
      console.error('Error loading Botbuster CDN script.');
    };
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
        this.injectCdnScript(this.email);
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

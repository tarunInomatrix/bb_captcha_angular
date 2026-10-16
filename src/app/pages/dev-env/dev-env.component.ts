import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Toast {
  id: number;
  title: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface DevLogEntry {
  time: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

@Component({
  selector: 'app-dev-env',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dev-env.component.html',
  styleUrl: './dev-env.component.css'
})
export class DevEnvComponent implements OnInit, OnDestroy {
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

  // Development Environment Configuration (defaults from git history)
  readonly envName = 'Development';
  cdnScriptUrl = 'https://botbuste.b-cdn.net/dev/quick-check-inject.js';
  readonly defaultCdnUrl = 'https://botbuste.b-cdn.net/dev/quick-check-inject.js';
  dataApiKey = '3ee57ddd-2946-449a-9908-8a28d7ce3960';
  currentURL = 'http://localhost:4200/';
  injectedEmail = 'tarunjajoria95@gmail.com';
  dataActionId = 'angular-auth-dev';
  dataEmailElement = 'email';

  // Dev debugging & inspect controls
  showConfigDrawer = false;
  scriptInjected = false;
  scriptLoaded = false;
  scriptStatus = 'Idle (Pending sign in)';
  lastSessionId = '';
  logs: DevLogEntry[] = [];

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.location) {
      this.currentURL = window.location.origin + '/dev';
    }
    this.addLog('info', 'Dev Environment initialized.');
  }

  ngOnDestroy(): void {
    this.removeInjectedScript();
  }

  private addLog(type: 'info' | 'success' | 'warn' | 'error', message: string) {
    const time = new Date().toLocaleTimeString();
    this.logs.unshift({ time, type, message });
    if (this.logs.length > 25) {
      this.logs.pop();
    }
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
    this.showToast('Autofilled', 'Dev sandbox credentials loaded.', 'info');
    this.addLog('info', `Autofilled credentials for: ${email}`);
  }

  resetCdnUrl() {
    this.cdnScriptUrl = this.defaultCdnUrl;
    this.showToast('Reset URL', 'Default Dev CDN script URL restored.', 'info');
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

  injectCdnScript(userEmail: string) {
    if (typeof window === 'undefined') return;

    const existingScript = document.getElementById('botbuster-script') as HTMLScriptElement;
    if (existingScript) {
      this.addLog('warn', 'BotBuster script already present in DOM. Re-initializing with user email.');
      this.scriptStatus = 'Script re-initialized';
      existingScript.setAttribute('data-email', userEmail || this.injectedEmail);
      if (typeof (window as any).initBotbusterSDK === 'function') {
        (window as any).initBotbusterSDK(userEmail || this.injectedEmail, null, true);
      }
      return;
    }

    const sessionId = this.generateSessionId();
    this.lastSessionId = sessionId;

    this.addLog('info', `Injecting dev script from: ${this.cdnScriptUrl}`);
    this.addLog('info', `Session ID: ${sessionId} | Target URL: ${this.currentURL}`);

    const script = document.createElement('script');
    script.id = 'botbuster-script';
    script.src = this.cdnScriptUrl;
    script.async = true;
    script.setAttribute('data-api-key', this.dataApiKey);
    script.setAttribute('data-email', userEmail || this.injectedEmail);
    script.setAttribute('data-loaded-captcha-url', this.currentURL);
    script.setAttribute('data-action-id', this.dataActionId);
    script.setAttribute('data-email-element', this.dataEmailElement);
    script.setAttribute('data-web-url', this.currentURL);
    script.setAttribute('data-device-type', 'desktop');
    script.setAttribute('data-session-id', sessionId);

    this.scriptInjected = true;
    this.scriptStatus = 'Injecting script tag...';

    script.onload = () => {
      console.log('[DEV] Botbuster dev CDN script loaded successfully.');
      this.scriptLoaded = true;
      this.scriptStatus = 'Dev CDN Loaded & Active';
      this.addLog('success', 'BotBuster Dev CDN script loaded and initialized.');
      this.showToast('Dev Captcha Ready', 'BotBuster Dev CDN injected successfully.', 'success');
    };

    script.onerror = () => {
      console.error('[DEV] Error loading Botbuster dev CDN script.');
      this.scriptLoaded = false;
      this.scriptStatus = 'Failed to load script';
      this.addLog('error', `Failed to load script from ${this.cdnScriptUrl}`);
      this.showToast('Dev Script Error', 'Failed to load Dev CDN script.', 'error');
    };

    document.body.appendChild(script);
  }

  removeInjectedScript() {
    if (typeof window === 'undefined') return;
    const script = document.getElementById('botbuster-script');
    if (script) {
      script.remove();
      this.addLog('warn', 'Removed #botbuster-script from DOM.');
    }
    const container = document.getElementById('botbuster-container');
    if (container) {
      container.innerHTML = '';
    }
    this.scriptInjected = false;
    this.scriptLoaded = false;
    this.scriptStatus = 'Idle (Cleaned up)';
  }

  handleLoginSubmit(event: Event) {
    event.preventDefault();
    if (!this.email || !this.password) return;

    this.isSubmitting = true;
    this.addLog('info', `Submitting login form for: ${this.email}`);

    setTimeout(() => {
      this.isSubmitting = false;
      if (this.password.length >= 6) {
        this.showToast('Dev Session Initiated', `Logged in as ${this.email}.`, 'success');
        this.addLog('success', `Auth successful. Triggering Dev Captcha script injection.`);
        this.injectCdnScript(this.email);
      } else {
        this.showToast('Dev Auth Failed', 'Password must be at least 6 characters.', 'error');
        this.addLog('warn', 'Password validation failed: length < 6.');
      }
    }, 800);
  }

  handleRegisterSubmit(event: Event) {
    event.preventDefault();
    if (!this.regName || !this.regEmail || !this.regPassword) return;

    this.showToast('Dev Account Created', `Welcome ${this.regName}!`, 'success');
    this.addLog('success', `Dev registration completed for ${this.regEmail}.`);
    setTimeout(() => {
      this.switchTab('signin');
      this.email = this.regEmail;
    }, 500);
  }

  handleRecoverySubmit(event: Event) {
    event.preventDefault();
    if (!this.recEmail) return;

    this.showToast('Dev Token Dispatched', `Recovery link sent to ${this.recEmail}.`, 'info');
    this.addLog('info', `Recovery requested for ${this.recEmail}.`);
  }

  handleSocialLogin(provider: string) {
    this.showToast('Dev OAuth', `Simulating ${provider} login...`, 'info');
    this.addLog('info', `Simulated OAuth login with ${provider}.`);
    setTimeout(() => {
      this.showToast('Integration Active', `Mock signed in with ${provider}.`, 'success');
    }, 700);
  }

  clearLogs() {
    this.logs = [];
    this.addLog('info', 'Logs cleared.');
  }
}

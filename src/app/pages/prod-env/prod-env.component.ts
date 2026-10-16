import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Toast {
  id: number;
  title: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-prod-env',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prod-env.component.html',
  styleUrl: './prod-env.component.css'
})
export class ProdEnvComponent implements OnDestroy {
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

  // Production Environment Configuration
  readonly envName = 'Production';
  readonly cdnScriptUrl = 'https://botbuste.b-cdn.net/prod/quick-check-inject-prod.js';
  readonly dataApiKey = '3ee57ddd-2946-449a-9908-8a28d7ce3960';
  readonly currentURL = 'https://bb-captcha-angular.vercel.app/';
  readonly injectedEmail = 'tarunjajoria95@gmail.com';
  readonly dataActionId = 'angular-auth';
  readonly dataEmailElement = 'email';

  // Live status tracking
  scriptInjected = false;
  scriptLoaded = false;
  scriptStatus = 'Idle (Pending sign in)';
  lastSessionId = '';

  ngOnDestroy(): void {
    this.removeInjectedScript();
  }

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

  injectCdnScript = (userEmail: string, submitCallback: () => void) => {
    if (typeof window === 'undefined') return;

    // 1. Assign the callback to global window so script can invoke it
    (window as any).onBotbusterSuccess = submitCallback;

    const existingScript = document.getElementById('botbuster-script') as HTMLScriptElement;

    if (existingScript) {
      // 2. Script already injected! Update data attribute and trigger manual init
      existingScript.setAttribute('data-email', userEmail);
      this.scriptStatus = 'Script re-initialized';
      if (typeof (window as any).initBotbusterSDK === 'function') {
        (window as any).initBotbusterSDK(userEmail, null, true);
      }
      return;
    }

    // 3. Inject script for the first time
    const script = document.createElement('script');
    script.id = 'botbuster-script';
    script.src = this.cdnScriptUrl;
    script.async = true;
    script.setAttribute('data-api-key', this.dataApiKey);
    script.setAttribute('data-email', userEmail);
    script.setAttribute('data-loaded-captcha-url', this.currentURL);
    script.setAttribute('data-action-id', this.dataActionId);
    script.setAttribute('data-email-element', this.dataEmailElement);
    script.setAttribute('data-web-url', this.currentURL);

    this.scriptInjected = true;
    this.scriptStatus = 'Injecting script tag...';

    script.onload = () => {
      console.log('[PROD] BotBuster CDN script loaded successfully.');
      this.scriptLoaded = true;
      this.scriptStatus = 'CDN Loaded & Active';
      this.showToast('Captcha Ready', 'BotBuster Production CDN loaded.', 'success');
    };

    script.onerror = () => {
      console.error('[PROD] Error loading BotBuster CDN script.');
      this.scriptLoaded = false;
      this.scriptStatus = 'Failed to load script';
      this.isSubmitting = false;
      this.showToast('CDN Error', 'Failed to load BotBuster production script.', 'error');
    };

    document.body.appendChild(script);
  };

  removeInjectedScript() {
    if (typeof window === 'undefined') return;
    delete (window as any).onBotbusterSuccess;
    const script = document.getElementById('botbuster-script');
    if (script) {
      script.remove();
      console.log('[PROD] Cleaned up BotBuster script.');
    }
    const container = document.getElementById('botbuster-container');
    if (container) {
      container.innerHTML = '';
    }
    this.scriptInjected = false;
    this.scriptLoaded = false;
    this.isSubmitting = false;
    this.scriptStatus = 'Idle (Cleaned up)';
  }

  handleLoginSubmit(event: Event) {
    event.preventDefault();
    if (!this.email || !this.password) {
      this.showToast('Missing Details', 'Please enter your email and password.', 'error');
      return;
    }

    this.isSubmitting = true;
    this.showToast('Verifying', `Triggering BotBuster verification for ${this.email}...`, 'info');

    const submitCallback = () => {
      this.isSubmitting = false;
      console.log('[PROD] onBotbusterSuccess callback received for:', this.email);
      this.showToast('Authentication Successful', `Verification passed! Signed in as ${this.email}.`, 'success');
    };

    this.injectCdnScript(this.email, submitCallback);
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
}

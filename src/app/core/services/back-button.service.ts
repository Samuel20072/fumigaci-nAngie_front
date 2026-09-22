import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root',
})
export class BackButtonService {
  private router = inject(Router);
  private location = inject(Location);
  private lastTimeBackPress = 0;

  /**
   * Initializes the Android hardware back button handler
   */
  init(): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    App.addListener('backButton', ({ canGoBack }) => {
      const currentUrl = this.router.url;

      // If at root or main tabs, check if we should exit
      const isRootRoute =
        currentUrl === '/' ||
        currentUrl === '/dashboard' ||
        currentUrl === '/customers' ||
        currentUrl === '/services' ||
        currentUrl === '/finances';

      if (isRootRoute && currentUrl === '/dashboard') {
        // Exit app if on the main dashboard
        App.exitApp();
      } else if (isRootRoute) {
        // If on another main tab, return to dashboard
        this.router.navigateByUrl('/dashboard');
      } else if (canGoBack) {
        // If in a sub-page/form/detail, go back in history
        this.location.back();
      } else {
        // Fallback to dashboard
        this.router.navigateByUrl('/dashboard');
      }
    });
  }
}

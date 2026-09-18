import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BottomNavComponent } from '../navigation/bottom-nav.component.js';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component.js';

@Component({
  selector: 'app-mobile-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, BottomNavComponent, ToastContainerComponent],
  template: `
    <div class="mobile-layout">
      <!-- Toast Container -->
      <app-toast-container></app-toast-container>

      <!-- Main App Content -->
      <main class="content-area">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Navigation -->
      <app-bottom-nav></app-bottom-nav>
    </div>
  `,
  styles: [`
    .mobile-layout {
      max-width: 540px;
      margin: 0 auto;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg-app);
      position: relative;
    }

    .content-area {
      flex: 1;
      padding-bottom: calc(var(--bottom-nav-height) + var(--safe-area-bottom) + 16px);
    }
  `]
})
export class MobileLayoutComponent {}

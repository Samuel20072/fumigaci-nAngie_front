import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackButtonService } from './core/services/back-button.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  title = 'FumiControl';
  private backButtonService = inject(BackButtonService);

  ngOnInit(): void {
    this.backButtonService.init();
  }
}


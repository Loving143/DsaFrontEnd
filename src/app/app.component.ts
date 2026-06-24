import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-dark-950 text-white">
      <app-navbar />
      <main class="pt-16">
        <router-outlet />
      </main>
    </div>
  `
})
export class AppComponent {}

import { Component, OnInit } from '@angular/core';

import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    private readonly platform: Platform,
    private readonly storageService: StorageService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.storageService.init();

    this.themeBars();
    this.initializeApp();
  }

  public themeBars(): void {
    /* This is kludge code. Android does not allow navbar to be colored while splash screen is present. That's a bug */
    /* I can't count on all devices to finish loading at the same time, this gives leeway */
    this.loadTheme();
    setTimeout(() => {
      this.loadTheme();
    }, 500);

    setTimeout(() => {
      this.loadTheme();
    }, 1000);

    setTimeout(() => {
      this.loadTheme();
    }, 2000);
  }

  private initializeApp(): void {
    this.platform.ready().then(async () => {
      if (!this.platform.is('hybrid')) {
        return;
      }

      try {
        await SplashScreen.hide();
      } catch {
        // Plugin not available (web or missing native implementation)
      }
    });
  }

  private loadTheme(): void {
    this.storageService.get<string>('theme').then(async (value) => {
      if (value) {
        const element = document.getElementById('body-theme');
        if (!element) {
          return;
        }

        element.classList.add(value);

        if (this.platform.is('hybrid') && this.platform.is('android')) {
          if (value === 'light') {
            await StatusBar.setBackgroundColor({ color: '#ffffff' });
            await StatusBar.setStyle({ style: Style.Light });
            element.classList.remove('dark');

            return;
          }
          if (value === 'dark') {
            await StatusBar.setBackgroundColor({ color: '#1f1f1f' });
            await StatusBar.setStyle({ style: Style.Dark });

            return;
          }

          return;
        }
      } else {
        await this.storageService.set('theme', 'light');
        const element = document.getElementById('body-theme');
        if (!element) {
          return;
        }

        if (this.platform.is('hybrid') && this.platform.is('android')) {
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          await StatusBar.setStyle({ style: Style.Light });

          return;
        }
      }

    });
  }
}

import { Component, OnInit } from "@angular/core";
import { Platform } from "@ionic/angular";
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { StorageService } from "./services/storage.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private storageService: StorageService
  ) { }

  async ngOnInit() {
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

  initializeApp() {
    this.platform.ready().then(async () => {
      await SplashScreen.hide();
    });
  }

  loadTheme() {
    this.storageService.get("theme").then(async (value) => {
      if (value) {
        var element = document.getElementById("body-theme");

        element.classList.add(value);

        if (this.platform.is("android")) {
          if (value === "light") {
            await StatusBar.setBackgroundColor({ color: '#ffffff' });
            await StatusBar.setStyle({ style: Style.Light })
            element.classList.remove("dark");

            return;
          }
          if (value === "dark") {
            await StatusBar.setBackgroundColor({ color: '#1f1f1f' });
            await StatusBar.setStyle({ style: Style.Dark })

            return;
          }

          return;
        }
      } else {
        this.storageService.set("theme", "light");
        var element = document.getElementById("body-theme");

        if (this.platform.is("android")) {
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          await StatusBar.setStyle({ style: Style.Light })

          return;
        }
      }

    });
  }
}

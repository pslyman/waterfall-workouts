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
  ) {}

  async ngOnInit() {
    await this.storageService.init();
    this.loadTheme();
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
            await StatusBar.setBackgroundColor({color: '#ffffff'});
            await StatusBar.setStyle({style: Style.Dark})
            element.classList.remove("dark");
            this.initializeApp();
            return;
          }
          if (value === "dark") {
            await StatusBar.setBackgroundColor({color: '#1f1f1f'});
            await StatusBar.setStyle({style: Style.Light})
            this.initializeApp();
            return;
          }
          this.initializeApp();
          return;
        } else {
          this.initializeApp();
        }
      } else {
        this.storageService.set("theme", "light");
        var element = document.getElementById("body-theme");

        if (this.platform.is("android")) {
            await StatusBar.setBackgroundColor({color: '#ffffff'});
            await StatusBar.setStyle({style: Style.Dark})
          this.initializeApp();
          return;
        } else {
          this.initializeApp();
        }
      }

    });
  }
}

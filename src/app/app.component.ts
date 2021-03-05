import { Component, OnInit } from '@angular/core';
import { Storage } from "@ionic/storage";
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
  ) {

  }

  ngOnInit() {
    this.loadTheme();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.splashScreen.hide();
    });
  }

  loadTheme() {
    this.storage.get("theme").then((value) => {
      if (value) {
        var element = document.getElementById("body-theme");

        element.classList.add(value);

        if (this.platform.is("android")) {
          if (value === "light") {
            this.statusBar.backgroundColorByHexString("#ffffff");
            this.statusBar.styleDefault();
            element.classList.remove("dark");
            this.initializeApp();
            return;
          }
          if (value === "dark") {
            this.statusBar.backgroundColorByHexString("#1f1f1f");
            this.statusBar.styleLightContent();
            this.initializeApp();
            return;
          }
          this.initializeApp();
          return;
        } else {
          this.initializeApp();
        }
      } else {
        this.storage.set("theme", "light");
        var element = document.getElementById("body-theme");

        if (this.platform.is("android")) {
          this.statusBar.backgroundColorByHexString("#ffffff");
          this.statusBar.styleDefault();
          this.initializeApp();
          return;
        } else {
          this.initializeApp();
        }
      }

    });

  }
}

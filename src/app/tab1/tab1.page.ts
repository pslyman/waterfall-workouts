import {
  trigger,
  style,
  animate,
  transition,
  keyframes,
  query,
  stagger,
} from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { ToastController, Platform } from "@ionic/angular";
import { AlertController } from "@ionic/angular";
import { StorageService } from "../services/storage.service";

interface workoutsInt {
  days: number;
  name: string;
  sets: number;
  reps: number;
  weight: string;
  countdown: number;
  originDate: number;
  setsDone: number;
  notes: string;
}

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"],
  animations: [
    trigger("inOutAnimation", [
      transition(":enter", [
        animate(
          ".3s ease-out",
          keyframes([
            style({
              opacity: 0,
              transform: "translateY(-35px) scale(1.05)",
              offset: 0,
            }),
            style({ opacity: 1, transform: "translateY(0)", offset: 1 }),
          ]),
        ),
      ]),
    ]),
    [
      trigger("cardIn", [
        transition(":enter", [
          style({ transform: "scale(.8)", top: "75px" }),
          animate(".5s ease-out", style({ transform: "scale(1)", top: 0 })),
        ]),
        transition(":leave", [
          style({ transform: "scale(1)", top: 0, opacity: 1 }),
          animate(
            ".2s ease-out",
            style({ transform: "scale(.8)", top: "75px", opacity: 0 }),
          ),
        ]),
      ]),
    ],
    [
      trigger("helpCardIn", [
        transition(":enter", [
          style({ transform: "scale(.8)", height: "0", opacity: 0 }),
          animate(
            ".5s ease-out",
            style({ transform: "scale(1)", height: "50px", opacity: 1 }),
          ),
        ]),
        transition(":leave", [
          style({ height: "50px", opacity: 1 }),
          animate(
            ".5s ease-out",
            style({
              transform: "scale(.8)",
              height: "0",
              opacity: 0,
              margin: 0,
            }),
          ),
        ]),
      ]),
    ],
    [
      // Trigger animation cards array
      trigger("cardAnimation", [
        // Transition from any state to any state
        transition("* => *", [
          // Initially the all cards are not visible
          query(":enter", style({ opacity: 0 }), { optional: true }),
          // Each card will appear sequentially with the delay of 300ms
          query(
            ":enter",
            stagger("45ms", [
              animate(
                ".5s ease-in",
                keyframes([
                  style({
                    opacity: 0,
                    transform: "translateY(-10px) scale(1.05)",
                    offset: 0,
                  }),
                  style({
                    opacity: 0.5,
                    transform: "translateY(-5px) scale(1)",
                    offset: 0.3,
                  }),
                  style({ opacity: 1, transform: "translateY(0)", offset: 1 }),
                ]),
              ),
            ]),
            { optional: true },
          ),
        ]),
      ]),
    ],
  ],
  standalone: false,
})
export class Tab1Page implements OnInit {
  workoutNames: workoutsInt[] = [];

  newName = "";
  newDays = null;
  newSets = null;
  newReps = null;
  newWeight = "";
  newWeightType = "";
  newCountdown = null;
  newNotes = "";

  newActive = false;

  useMetric = "true";

  inEdit = false;
  nameOfEditItem = "";

  constructor(
    public toastController: ToastController,
    public alertController: AlertController,
    private storageService: StorageService,
    private platform: Platform,
  ) {}

  ngOnInit() {
    this.getStorage();

    this.storageService.get("useMetricDefault").then((value) => {
      if (value) {
        this.useMetric = value;
      } else {
        this.storageService.set("useMetricDefault", "true");
      }
    });
  }

  toggleMoonlight() {
    this.getStorage();
    var element = document.getElementById("body-theme");
    element.classList.remove("light");
    element.classList.remove("dark");
    element.classList.remove("amoled");

    this.storageService.get("theme").then(async (value) => {
      if (value === "light") {
        element.classList.add("dark");

        this.storageService.set("theme", "dark");
      } else {
        this.storageService.set("theme", "light");
      }

      if (this.platform.is("android")) {
        if (value === "dark") {
          await StatusBar.setBackgroundColor({ color: "#ffffff" });
          await StatusBar.setStyle({ style: Style.Light });
          return;
        }
        if (value === "light") {
          await StatusBar.setBackgroundColor({ color: "#1f1f1f" });
          await StatusBar.setStyle({ style: Style.Dark });
          return;
        }
      }
    });
  }

  openInformation(): void {
    // placeholder
  }

  async colorValueChange(value) {
    if (this.platform.is("android")) {
      if (value === "light") {
        await StatusBar.setBackgroundColor({ color: "#ffffff" });
        await StatusBar.setStyle({ style: Style.Light });
        return;
      }
      if (value === "dark") {
        await StatusBar.setBackgroundColor({ color: "#1f1f1f" });
        await StatusBar.setStyle({ style: Style.Dark });
        return;
      }

      return;
    }
  }

  getStorage() {
    this.storageService.get("workouts").then((list) => {
      if (list) {
        this.workoutNames = JSON.parse(list);
      }
    });
  }

  sortWorkouts() {
    this.workoutNames.sort((a, b) =>
      (this.getDifferenceBetweenTimes(a.originDate) === 0)
        .toString()
        .localeCompare(
          (this.getDifferenceBetweenTimes(a.originDate) === 0).toString(),
        ),
    );

    this.workoutNames.sort((a, b) =>
      (a.days / this.getDifferenceBetweenTimes(a.originDate))
        .toString()
        .localeCompare(
          (b.days / this.getDifferenceBetweenTimes(b.originDate)).toString(),
        ),
    );
  }

  getCurrentTimeNumber() {
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth();
    let day = d.getDate();

    return Number(new Date(year, month, day));
  }

  getDifferenceBetweenTimes(firstDate: number) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

    const secondDate = this.getCurrentTimeNumber();

    const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));

    return diffDays;
  }

  itemDone(name: string) {
    let match = this.workoutNames.find((i) => i.name === name);

    if (!!match) {
      match.originDate = this.getCurrentTimeNumber();
    }

    this.saveToStorage();
  }

  itemRestart(name: string) {
    let match = this.workoutNames.find((i) => i.name === name);

    if (!!match) {
      match.setsDone = 0;
      match.originDate = this.getCurrentTimeNumber() - 100000000;
    }
    this.saveToStorage();
  }

  itemSetSubtraction(name: string) {
    let match = this.workoutNames.find((i) => i.name === name);

    if (!!match && match.setsDone != match.sets) {
      match.setsDone++;

      if (match.setsDone === match.sets) {
        match.setsDone = 0;
        match.originDate = this.getCurrentTimeNumber();
      }
    }
    this.saveToStorage();
  }
  itemSetAddition(name: string) {
    let match = this.workoutNames.find((i) => i.name === name);

    if (!!match && match.setsDone > 0) {
      match.setsDone--;
    }
    this.saveToStorage();
  }

  async toggleNew() {
    this.saveToStorage();
    this.newActive = !this.newActive;
    this.clearAddWorkout();
  }

  async addNewWorkout() {
    if (this.workoutNames) {
      if (this.workoutNames.some((i) => i.name === this.newName)) {
        const toast = await this.toastController.create({
          message: `"${this.newName}" already exists`,
          duration: 2000,
        });
        toast.present();

        return;
      }
    }

    this.storageService.get("useMetricDefault").then((value) => {
      this.useMetric = value;
    });
    if (this.newWeight) {
      if (this.useMetric === "true") {
        this.newWeightType = "kg";
        this.newWeight = `${this.newWeight}${this.newWeightType}`;
      } else if (this.useMetric === "false") {
        this.newWeightType = "lbs";
        this.newWeight = `${this.newWeight}${this.newWeightType}`;
      }
    }

    if (!this.newDays) {
      this.newDays = 3;
    }

    this.workoutNames = this.workoutNames || [];

    this.workoutNames.push({
      days: this.newDays,
      name: this.newName,
      sets: this.newSets,
      reps: this.newReps,
      weight: `${this.newWeight}`,
      countdown: this.newCountdown,
      originDate: this.getCurrentTimeNumber() - 100000000,
      setsDone: 0,
      notes: this.newNotes,
    });

    this.saveToStorage();

    const toast = await this.toastController.create({
      message: `${this.newName} added.`,
      duration: 4000,
    });
    toast.present();

    this.clearAddWorkout();
    this.newActive = !this.newActive;
  }

  saveToStorage() {
    this.sortWorkouts();
    this.storageService.set("workouts", JSON.stringify(this.workoutNames));
  }

  clearAddWorkout() {
    this.newName = "";
    this.newDays = null;
    this.newSets = null;
    this.newReps = null;
    this.newWeight = "";
    this.newWeightType = "";
    this.newCountdown = null;
    this.newNotes = "";
  }

  async deleteWorkout() {
    const alert = await this.alertController.create({
      cssClass: "my-custom-class",
      header: "Confirm",
      message: `Are you sure you want to delete ${this.nameOfEditItem}?`,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {},
        },
        {
          text: "Yes",
          handler: () => {
            this.workoutNames = this.workoutNames.filter(
              (i) => i.name !== this.nameOfEditItem,
            );
            this.inEdit = false;
            this.newActive = false;
          },
        },
      ],
    });

    await alert.present();
  }

  radioChange(e) {
    this.useMetric = e.target.value;
    this.storageService.set("useMetricDefault", e.target.value);
  }

  editItem(itemName) {
    let match = this.workoutNames.find((i) => i.name === itemName);
    this.storageService.get("useMetricDefault").then((value) => {
      this.useMetric = value;
    });
    if (!!match) {
      this.newName = match.name;
      this.newDays = match.days;
      this.newSets = match.sets;
      this.newReps = match.reps;
      this.newWeight = match.weight.replace(/\D/g, "");

      if (match.weight) {
        const grabType = match.weight.match(/[a-zA-Z]+/g);

        if (grabType[0] === "kg") {
          this.useMetric = "true";
        } else {
          this.useMetric = "false";
        }
      }
      this.newCountdown = match.countdown;
      this.newNotes = match.notes;
    }
    this.nameOfEditItem = itemName;
    this.inEdit = true;
    this.newActive = true;
    this.saveToStorage();
  }

  cancelChanges() {
    this.inEdit = false;
    this.newActive = false;
    this.clearAddWorkout();
  }

  async saveChanges() {
    this.storageService.get("useMetricDefault").then((value) => {
      this.useMetric = value;
    });
    if (this.newWeight) {
      if (this.useMetric === "true") {
        this.newWeightType = "kg";
        this.newWeight = `${this.newWeight}${this.newWeightType}`;
      } else if (this.useMetric === "false") {
        this.newWeightType = "lbs";
        this.newWeight = `${this.newWeight}${this.newWeightType}`;
      }
    }

    let match = this.workoutNames.find((i) => i.name === this.nameOfEditItem);

    if (!!match) {
      match.days = this.newDays;
      match.name = this.newName;
      match.sets = this.newSets;
      match.reps = this.newReps;
      match.weight = `${this.newWeight}`;
      match.countdown = this.newCountdown;
      match.notes = this.newNotes;
    }

    this.saveToStorage();

    const toast = await this.toastController.create({
      message: `${this.newName} updated.`,
      duration: 2000,
    });
    toast.present();

    this.inEdit = false;
    this.newActive = false;
    this.clearAddWorkout();
  }
}

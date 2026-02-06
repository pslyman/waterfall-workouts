import {
  animate,
  keyframes,
  query,
  stagger,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import {
  ActionSheetController,
  AlertController,
  Platform,
  ToastController,
} from "@ionic/angular";
import { StorageService } from "../services/storage.service";

interface Workout {
  days: number;
  name: string;
  sets: number | null;
  reps: number | null;
  weight: string;
  countdown: number | null;
  originDate: number;
  setsDone: number;
  notes: string;
}

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"],
  animations: [
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
  workoutNames: Workout[] = [];

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
    private actionSheetCtrl: ActionSheetController,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.storageService.init();
      await this.loadWorkouts();

      const metricDefault = await this.storageService.get<string>(
        "useMetricDefault",
      );

      if (metricDefault) {
        this.useMetric = metricDefault;
        return;
      }

      this.useMetric = "true";
      await this.storageService.set("useMetricDefault", "true");
    } catch {
      const toast = await this.toastController.create({
        message: "Storage failed to initialize",
        duration: 2000,
      });
      await toast.present();
    }
  }

  async toggleMoonlight(): Promise<void> {
    const element = document.getElementById("body-theme");
    if (!element) {
      return;
    }
    element.classList.remove("light");
    element.classList.remove("dark");
    element.classList.remove("amoled");

    const currentTheme = await this.storageService.get<string>("theme");
    const nextTheme = currentTheme === "light" ? "dark" : "light";

    element.classList.add(nextTheme);
    await this.storageService.set("theme", nextTheme);

    if (this.platform.is("hybrid") && this.platform.is("android")) {
      if (nextTheme === "light") {
        await StatusBar.setBackgroundColor({ color: "#ffffff" });
        await StatusBar.setStyle({ style: Style.Light });
        return;
      }
      if (nextTheme === "dark") {
        await StatusBar.setBackgroundColor({ color: "#1f1f1f" });
        await StatusBar.setStyle({ style: Style.Dark });
        return;
      }
    }
  }

  async openActionSheet(item: Workout): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: "Actions",
      buttons: [
        {
          text: "Done",
          handler: (): void => {
            void this.itemDone(item.name);
          },
        },
        {
          text: "Restart",
          handler: (): void => {
            void this.itemRestart(item.name);
          },
        },
        {
          text: "Edit",
          handler: (): void => {
            this.editItem(item.name);
          },
        },
        {
          text: "Delete",
          role: "destructive",
          handler: (): void => {
            this.nameOfEditItem = item.name;
            void this.deleteWorkout();
          },
        },
        {
          text: "Dismiss",
          role: "cancel",
          handler: (): void => {
            this.actionSheetCtrl.dismiss();
          },
        },
      ],
    });

    await actionSheet.present();
  }

  async colorValueChange(value: string) {
    if (this.platform.is("hybrid") && this.platform.is("android")) {
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

  private async loadWorkouts(): Promise<void> {
    let stored: string | Workout[] | null = null;

    try {
      stored = await this.storageService.get<string | Workout[]>("workouts");
    } catch {
      this.workoutNames = [];
      return;
    }

    if (!stored) {
      this.workoutNames = [];
      return;
    }

    if (Array.isArray(stored)) {
      this.workoutNames = stored;
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      this.workoutNames = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.workoutNames = [];
    }
  }

  sortWorkouts() {
    const cached = new Map<Workout, { daysSince: number; score: number }>();

    const getMeta = (workout: Workout): { daysSince: number; score: number } => {
      const existing = cached.get(workout);
      if (existing) {
        return existing;
      }

      const daysSince = this.getDifferenceBetweenTimes(workout.originDate);
      const allowedDays = workout.days > 0 ? workout.days : 1;

      const meta = {
        daysSince,
        // Higher score = more overdue relative to intent (e.g. 12 days since / 10 day cadence = 1.2)
        score: daysSince / allowedDays,
      };

      cached.set(workout, meta);
      return meta;
    };

    this.workoutNames.sort((a, b) => {
      const metaA = getMeta(a);
      const metaB = getMeta(b);

      if (metaB.score !== metaA.score) {
        return metaB.score - metaA.score;
      }

      if (metaB.daysSince !== metaA.daysSince) {
        return metaB.daysSince - metaA.daysSince;
      }

      return a.name.localeCompare(b.name);
    });
  }

  getCurrentTimeNumber() {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();

    return Number(new Date(year, month, day));
  }

  getDifferenceBetweenTimes(firstDate: number) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

    const secondDate = this.getCurrentTimeNumber();

    const diffDays = Math.round((secondDate - firstDate) / oneDay);
    return Number.isFinite(diffDays) ? Math.max(0, diffDays) : 0;
  }

  async itemDone(name: string): Promise<void> {
    const match = this.workoutNames.find((i) => i.name === name);

    if (match) {
      match.originDate = this.getCurrentTimeNumber();
    }

    await this.persistWorkouts();
  }

  async itemRestart(name: string): Promise<void> {
    const match = this.workoutNames.find((i) => i.name === name);

    if (match) {
      match.setsDone = 0;
      match.originDate = this.getCurrentTimeNumber() - 100000000;
    }

    await this.persistWorkouts();
  }

  async itemSetSubtraction(name: string): Promise<void> {
    const match = this.workoutNames.find((i) => i.name === name);

    if (!match || !match.sets || match.setsDone >= match.sets) {
      return;
    }

    match.setsDone++;

    if (match.setsDone === match.sets) {
      match.setsDone = 0;
      match.originDate = this.getCurrentTimeNumber();
    }

    const didSave = await this.persistWorkouts();
    if (!didSave) {
      return;
    }

    const toast = await this.toastController.create({
      message: `1 set of ${match.name} completed`,
      duration: 1500,
    });
    await toast.present();
  }

  // Not currently in use
  async itemSetAddition(name: string): Promise<void> {
    const match = this.workoutNames.find((i) => i.name === name);

    if (match && match.setsDone > 0) {
      match.setsDone--;
    }

    await this.persistWorkouts();
  }

  toggleNew(): void {
    if (this.newActive) {
      this.cancelChanges();
      return;
    }

    this.inEdit = false;
    this.nameOfEditItem = "";
    this.clearAddWorkout();
    this.newActive = true;
  }

  async addNewWorkout(): Promise<void> {
    const name = this.newName.trim();

    if (!name) {
      const toast = await this.toastController.create({
        message: "Workout name is required",
        duration: 2000,
      });
      await toast.present();
      return;
    }

    if (this.workoutNames.some((i) => i.name === name)) {
      const toast = await this.toastController.create({
        message: `"${name}" already exists`,
        duration: 2000,
      });
      await toast.present();
      return;
    }

    const days = this.toNumberOrNull(this.newDays) ?? 3;

    this.workoutNames.push({
      days,
      name,
      sets: this.toNumberOrNull(this.newSets),
      reps: this.toNumberOrNull(this.newReps),
      weight: this.formatWeight(this.newWeight),
      countdown: this.toNumberOrNull(this.newCountdown),
      originDate: this.getCurrentTimeNumber() - 100000000,
      setsDone: 0,
      notes: this.newNotes,
    });

    const didSave = await this.persistWorkouts();
    if (!didSave) {
      return;
    }

    const toast = await this.toastController.create({
      message: `${name} added.`,
      duration: 4000,
    });
    await toast.present();

    this.cancelChanges();
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const numberValue = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  private formatWeight(value: unknown): string {
    const raw = String(value ?? "").trim();
    if (!raw) {
      return "";
    }

    const unit = this.useMetric === "true" ? "kg" : "lbs";
    return `${raw}${unit}`;
  }

  private async persistWorkouts(): Promise<boolean> {
    this.sortWorkouts();

    try {
      await this.storageService.set("workouts", JSON.stringify(this.workoutNames));
      return true;
    } catch {
      const toast = await this.toastController.create({
        message: "Failed to save workouts.",
        duration: 2000,
      });
      await toast.present();
      return false;
    }
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
    const nameToDelete = this.nameOfEditItem;

    const alert = await this.alertController.create({
      cssClass: "my-custom-class",
      header: "Confirm",
      message: `Are you sure you want to delete ${nameToDelete}?`,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Yes",
          role: "destructive",
          handler: (): void => {
            void this.deleteWorkoutConfirmed(nameToDelete);
          },
        },
      ],
    });

    await alert.present();
  }

  private async deleteWorkoutConfirmed(nameToDelete: string): Promise<void> {
    this.workoutNames = this.workoutNames.filter((i) => i.name !== nameToDelete);

    const didSave = await this.persistWorkouts();
    if (!didSave) {
      return;
    }

    const toast = await this.toastController.create({
      message: `${nameToDelete} deleted.`,
      duration: 2000,
    });
    await toast.present();

    this.cancelChanges();
  }

  async radioChange(e: CustomEvent<{ value: string }>): Promise<void> {
    this.useMetric = e.detail.value;
    await this.storageService.set("useMetricDefault", e.detail.value);
  }

  editItem(itemName: string): void {
    const match = this.workoutNames.find((i) => i.name === itemName);

    if (!match) {
      return;
    }

    this.newName = match.name;
    this.newDays = match.days;
    this.newSets = match.sets;
    this.newReps = match.reps;
    this.newWeight = match.weight ? match.weight.replace(/[^0-9.]/g, "") : "";

    const unit = match.weight.match(/[a-zA-Z]+/)?.[0];
    if (unit === "kg") {
      this.useMetric = "true";
    }
    if (unit === "lbs") {
      this.useMetric = "false";
    }

    this.newCountdown = match.countdown;
    this.newNotes = match.notes;

    this.nameOfEditItem = itemName;
    this.inEdit = true;
    this.newActive = true;
  }

  cancelChanges() {
    this.inEdit = false;
    this.nameOfEditItem = "";
    this.newActive = false;
    this.clearAddWorkout();
  }

  async saveChanges() {
    const name = this.newName.trim();
    const originalName = this.nameOfEditItem;

    if (!name) {
      const toast = await this.toastController.create({
        message: "Workout name is required",
        duration: 2000,
      });
      await toast.present();
      return;
    }

    if (name !== originalName && this.workoutNames.some((i) => i.name === name)) {
      const toast = await this.toastController.create({
        message: `"${name}" already exists`,
        duration: 2000,
      });
      await toast.present();
      return;
    }

    const match = this.workoutNames.find((i) => i.name === this.nameOfEditItem);

    if (match) {
      match.days = this.toNumberOrNull(this.newDays) ?? 3;
      match.name = name;
      match.sets = this.toNumberOrNull(this.newSets);
      match.reps = this.toNumberOrNull(this.newReps);
      match.weight = this.formatWeight(this.newWeight);
      match.countdown = this.toNumberOrNull(this.newCountdown);
      match.notes = this.newNotes;
    }

    const didSave = await this.persistWorkouts();
    if (!didSave) {
      return;
    }

    const toast = await this.toastController.create({
      message: `${name} updated.`,
      duration: 2000,
    });
    await toast.present();

    this.cancelChanges();
  }
}

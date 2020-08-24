import { Component, OnInit } from "@angular/core";
import { ToastController } from "@ionic/angular";
import { async } from "rxjs/internal/scheduler/async";

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"],
})
export class Tab1Page implements OnInit {
  workoutNames = [
    {
      days: 3,
      name: "Squats",
      sets: 3,
      reps: 8,
      weight: "10lbs",
      countdown: 10,
      originDate: 1598248800000,
      setsDone: 0,
    },
  ];

  newName = "";
  newDays = null;
  newSets = null;
  newReps = null;
  newWeight = "";
  newWeightType = "";
  newCountdown = null;

  newActive = false;

  useMetric = "true";

  constructor(public toastController: ToastController) {}

  ngOnInit() {}

  getCurrentTimeNumber() {
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth();
    let day = d.getDate();

    return Number(new Date(year, month, day));
  }

  getDifferenceBetweenTimes(firstDate) {
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
  }

  itemRestart(name: string) {
    let match = this.workoutNames.find((i) => i.name === name);

    if (!!match) {
      match.originDate = this.getCurrentTimeNumber() - 100000000;
    }
  }

  itemSetSubtraction(name: string) {
    let match = this.workoutNames.find((i) => i.name === name);

    if (!!match && match.setsDone != match.sets) {
      match.setsDone++;

      if (match.setsDone === match.sets) {
        match.setsDone = 0;
      }
    }
  }
  itemSetAddition(name: string) {
    let match = this.workoutNames.find((i) => i.name === name);

    if (!!match && match.setsDone > 0) {
      match.setsDone--;
    }
  }

  toggleNew() {
    this.newActive = !this.newActive;
  }

  async addNewWorkout() {
    if (this.newWeight) {
      if (this.useMetric) {
        this.newWeightType = "kg";
        this.newWeight = `${this.newWeight}${this.newWeightType}`;
      } else {
        this.newWeightType = "lbs";
        this.newWeight = `${this.newWeight}${this.newWeightType}`;
      }
    }

    if (!this.newDays) {
      this.newDays = 3;
    }

    this.workoutNames.push({
      days: this.newDays,
      name: this.newName,
      sets: this.newSets,
      reps: this.newReps,
      weight: `${this.newWeight}`,
      countdown: this.newCountdown,
      originDate: this.getCurrentTimeNumber() - 300000000,
      setsDone: 0,
    });

    const toast = await this.toastController.create({
      message: `${this.newName} has been added.`,
      duration: 2000,
    });
    toast.present();

    this.clearAddWorkout();
  }

  clearAddWorkout() {
    this.newName = "";
    this.newDays = null;
    this.newSets = null;
    this.newReps = null;
    this.newWeight = "";
    this.newWeightType = "";
    this.newCountdown = null;
  }

  radioChange(e) {
    this.useMetric = e.target.value;
  }
}

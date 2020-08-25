import { trigger, style, animate, transition } from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { ToastController } from "@ionic/angular";
import { AlertController } from "@ionic/angular";
import { Insomnia } from "@ionic-native/insomnia/ngx";

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"],
  animations: [
    trigger("inOutAnimation", [
      transition(":enter", [
        style({ bottom: "200%" }),
        animate(".5s ease-out", style({ bottom: "0" })),
      ]),
      transition(":leave", [
        style({ bottom: 0 }),
        animate(".5s ease-in", style({ bottom: "200%" })),
      ]),
    ]),
  ],
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
      originDate: 1598248800000 - 100000000,
      setsDone: 0,
      timeLeft: ".1",
      notes:
        "It's like you're sitting in a chair, but there's actually no chair.",
    },
  ];

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

  timerDisplayed = "Starting timer";
  timerActive = false;

  thatTimerThing;

  constructor(
    public toastController: ToastController,
    public alertController: AlertController,
    private insomnia: Insomnia
  ) {}

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
      match.timeLeft = this.newCountdown ? this.newCountdown.toString() : null;
    }
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
  }
  itemSetAddition(name: string) {
    let match = this.workoutNames.find((i) => i.name === name);

    if (!!match && match.setsDone > 0) {
      match.setsDone--;
    }
  }

  setTimerActive() {
    this.timerActive = true;
    this.insomnia.keepAwake().then(
      () => console.log("success"),
      () => console.log("error")
    );
  }

  beginTimer(itemName) {
    this.setTimerActive();
    let timerAmount: string;

    let match = this.workoutNames.find((i) => i.name === itemName);

    if (!!match) {
      if (match.timeLeft) {
        let hms = match.timeLeft; // your input string

        if (hms.includes(":")) {
          let a = hms.split(":"); // split it at the colons

          let hour = +a[0] * 60;
          let minutes = +a[1];
          let seconds = +a[2] / 60;

          const time = hour + minutes + seconds;
          timerAmount = time.toString();
        } else {
          timerAmount = hms;
        }
      } else {
        timerAmount = match.countdown.toString();
      }
    }

    let audio = new Audio("../../assets/alarmSound.mp3");

    // Set the date we're counting down to
    let countDownDate = new Date(
      new Date().valueOf() + Number(timerAmount) * 60100
    ).getTime();

    // Update the count down every 1 second
    this.thatTimerThing = setInterval(function () {
      // Get today's date and time
      let now = new Date().getTime();

      // Find the distance between now and the count down date
      let distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds

      let hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance > 0) {
        document.getElementById(
          "timerHTML"
        ).innerHTML = `${itemName} timer <br /> ${hours}:${minutes}:${seconds}`;
      }
      if (!this.timerActive) {
        if (!!match) {
          if (
            (!hours || hours < 0) &&
            (!minutes || minutes < 0) &&
            (!seconds || seconds < 0)
          ) {
            match.timeLeft = "";
          } else {
            match.timeLeft = `${hours}:${minutes}:${seconds}`;
          }
        }
      }
      if (distance < 0) {
        document.getElementById(
          "timerHTML"
        ).innerHTML = `${itemName} timer <br /> Time's up!`;
        audio.play();
      }
    }, 1000);
  }

  stopTimer() {
    this.timerActive = false;
    this.insomnia.allowSleepAgain().then(
      () => console.log("success"),
      () => console.log("error")
    );
    clearInterval(this.thatTimerThing);

    this.workoutNames.forEach((i) => {
      if (i.timeLeft === "") {
        i.originDate = this.getCurrentTimeNumber();
      }
    });
  }

  toggleNew() {
    this.newActive = !this.newActive;
  }

  async addNewWorkout() {
    if (this.workoutNames.some((i) => i.name === this.newName)) {
      const toast = await this.toastController.create({
        message: `"${this.newName}" already exists`,
        duration: 2000,
      });
      toast.present();

      return;
    }

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
      timeLeft: this.newCountdown ? this.newCountdown.toString() : null,
      notes: this.newNotes,
    });

    const toast = await this.toastController.create({
      message: `${this.newName} added.`,
      duration: 4000,
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
            console.log("Confirm Okay");
            this.workoutNames = this.workoutNames.filter(
              (i) => i.name !== this.nameOfEditItem
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
  }

  editItem(itemName) {
    let match = this.workoutNames.find((i) => i.name === itemName);

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
    }
    this.nameOfEditItem = itemName;
    this.inEdit = true;
    this.newActive = true;
  }

  cancelChanges() {
    this.inEdit = false;
    this.newActive = false;
    this.clearAddWorkout();
  }

  async saveChanges() {
    if (this.workoutNames.some((i) => i.name === this.newName)) {
      const toast = await this.toastController.create({
        message: `"${this.newName}" already exists`,
        duration: 2000,
      });
      toast.present();

      return;
    }

    if (this.newWeight) {
      if (this.useMetric) {
        this.newWeightType = "kg";
        this.newWeight = `${this.newWeight}${this.newWeightType}`;
      } else {
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
    }

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

import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  workoutNames = [
    {days: 3, name: 'Pushups', sets: 3, reps: 8, weight: "10lbs"},
    {days: 3, name: 'Pullups', sets: 3, reps: 8, weight: "10lbs" },
    {days: 3, name: 'Legups', sets: 3, reps: 8, weight: "10lbs"},
    {days: 3, name: 'Squats', sets: 3, reps: 8, weight: "10lbs"}
  ]

  constructor() {}

}

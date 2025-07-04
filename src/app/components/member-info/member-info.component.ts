import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-member-info',
  imports: [FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './member-info.component.html',
  styleUrl: './member-info.component.scss'
})
export class MemberInfoComponent {
  memberInfoForm!: FormGroup;

  years: number[] = [];
  months: number[] = [];
  days: number[] = [];

  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  selectedDay: number | null = null;

  constructor() {}

  ngOnInit(): void {

  }

}

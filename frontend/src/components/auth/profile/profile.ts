import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileViewModel } from './profile.vm';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  providers: [ProfileViewModel],
})
export class ProfileComponent {
  constructor(public vm: ProfileViewModel) {}
}
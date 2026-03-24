import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterViewModel } from './register.vm';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  providers: [RegisterViewModel, AuthService],
})
export class RegisterComponent {
  constructor(public vm: RegisterViewModel) {}
}
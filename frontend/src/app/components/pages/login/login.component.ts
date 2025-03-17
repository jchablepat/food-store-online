import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TextInputComponent } from "../../partials/text-input/text-input.component";
import { DefaultButtonComponent } from "../../partials/default-button/default-button.component";
import { TitleComponent } from "../../partials/title/title.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TextInputComponent, DefaultButtonComponent, RouterModule, TitleComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;
  isSubmitted = false;
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder, 
    private userService:UserService,
    private activedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit():void {
    this.loginForm = this.formBuilder.group({
      email: ['', [ Validators.required, Validators.email]],
      password: ['',  [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.activedRoute.snapshot.queryParams['returnUrl'];
  }

  get FormControls() {
    return this.loginForm.controls;
  }

  Login() {
    this.isSubmitted = true;
    if(this.loginForm.invalid) return;
    
    this.userService.login({
      email: this.FormControls['email'].value,
      password: this.FormControls['password'].value
    }).subscribe(() => {
      this.router.navigateByUrl(this.returnUrl);
    });
  }
}

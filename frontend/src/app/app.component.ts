import { Component, VERSION } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "./components/partials/header/header.component";
import { LoadingComponent } from "./components/partials/loading/loading.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HeaderComponent, LoadingComponent],//[RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Home Burger!';
  footer : string = 'Angular version ' + VERSION.full;
}

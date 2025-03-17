import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  searchTerm = '';
  route:ActivatedRoute = inject(ActivatedRoute);

  constructor(private router:Router) {
    this.route.params.subscribe((params) => {
      if(params['filter']) this.searchTerm = params['filter'];
    });
  }

  search(term: string):void {
    if(term) {
      this.router.navigateByUrl('/search/' + term);
    }
  }
}

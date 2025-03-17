import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css'
})
export class StarRatingComponent {
  @Input() maxRating: number = 5;
  @Input() readonly: boolean = false;
  @Input() stars!: number;
  @Input() size: number = 1;
  @Output() ratingChange = new EventEmitter<number>(); // Se emite cuando cambia la calificación

  hoverRating: number = 0;
  starList: number[] = []; // Array of stars to be displayed: E.g [1, 2, 3, 4, 5]

  ngOnInit() {
    this.starList = Array(this.maxRating).fill(0).map((_, i) => i + 1); 
  }

  setRate(stars: number) {
    if (!this.readonly) {
      this.stars = stars;
      this.ratingChange.emit(this.stars);
    }
  }

  hover(rating: number) {
    if (!this.readonly) {
      this.hoverRating = rating;
    }
  }

  get styles() {
    return {
      'width.rem': this.size,
      'height.rem': this.size,
      'margin-right.rem': this.size / 6
    };
  }

  getStarImage(currentRating: number) {
    const previousHalf = currentRating - 0.5;
    const imageName = this.stars >= currentRating 
    ? 'star-full'
    : this.stars >= previousHalf 
    ? 'star-half' 
    : 'star-empty';

    return `assets/stars/${imageName}.svg`;
  }
}

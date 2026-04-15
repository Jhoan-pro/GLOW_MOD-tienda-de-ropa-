import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private categorySubject = new BehaviorSubject<string>('Todos');
  category$ = this.categorySubject.asObservable();

  setCategory(category: string) {
    this.categorySubject.next(category);
  }
}
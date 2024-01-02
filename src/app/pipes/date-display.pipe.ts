import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'dateDisplay',
  standalone: true,
})
export class DateDisplayPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}
  transform(value: any): unknown {
    if (!value) {
      return '';
    }
    return this.datePipe.transform(value?.toMillis(), 'short') || '';
  }
}

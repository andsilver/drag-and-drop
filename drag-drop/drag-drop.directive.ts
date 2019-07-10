import { Directive, OnDestroy, ElementRef, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DragDropService } from './drag-drop.service';
import { Group, List } from './drag-drop.model';

interface ControlValueAccessor {
  writeValue(obj: any): void
  registerOnChange(fn: any): void
  registerOnTouched(fn: any): void
}

@Directive({
  selector: '[dragDrop]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DragDropDirective),
      multi: true
    }
  ]
})
export class DragDropDirective implements OnDestroy, ControlValueAccessor {

  list: List;
  name: string;
  subscription: Subscription;

  model: any[];

  @Input()
  set dragDrop(value: string) {
    setTimeout(() => this.setDragList(value));
  }

  constructor(
    private el: ElementRef,
    private dragDropService: DragDropService
  ) { }

  ngOnDestroy() {
    if (Object.keys(this.dragDropService.groups).length === 0)
      this.dragDropService.subscription.forEach(s => s.unsubscribe());
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  setDragList(name: string) {
    if (!this.el)
      return;

    this.name = name;
    let group = this.dragDropService.findGroup(name);
    if (!group) {
      group = new Group(name, [], this.dragDropService);
      this.dragDropService.addGroup(group);
    } else if (this.list) {
      group.removeList(this.list);
      this.list = null;
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }

    const host = this.el.nativeElement;
    const { children } = host;

    this.list = new List(host, children, [], group, this.model);
    this.subscription = this.list.onDrop.subscribe(() => {
      this.propagateChange(this.list.model);
    });
    group.lists.push(this.list);
  }

  writeValue(value: any[]) {
    this.model = value;
    setTimeout(() => this.setDragList(this.name));
  }

  propagateChange = (_: any) => { };

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() { }

}

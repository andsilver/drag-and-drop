import { Injectable } from '@angular/core';
import { Groups, Group, Item } from './drag-drop.model';
import { Subject, Subscription } from 'rxjs';

interface IEvent {
  item: Item;
  event: DragEvent;
}

@Injectable({
  providedIn: 'root'
})
export class DragDropService {

  subscription: Subscription[] = [];
  groups: Groups = {};

  //------- Events
  dragstart = new Subject<IEvent>();
  dragenter = new Subject<IEvent>();
  drag = new Subject<IEvent>();
  dragend = new Subject<IEvent>();

  //------- Dragging
  dragging: Item = null;

  constructor() {
    this.subscription = [
      this.dragstart.subscribe(this.onDragStart),
      this.dragend.subscribe(this.onDragEnd),
      this.dragenter.subscribe(this.onDragEnter)
    ];
  }

  addGroup(group: Group) {
    this.groups[group.name] = group;
  }

  findGroup(name: string) {
    return this.groups ? this.groups[name] : null;
  }

  removeGroup(name: string) {
    this.groups[name].clear();
    delete this.groups[name];
  }


  // ------------ Event handlers

  onDragStart = ({ item, event }: IEvent) => {
    this.dragging = item;
    this.dragging.element.style.opacity = '0.5';
    event.dataTransfer.setDragImage(
      item.element,
      item.handler.offsetLeft - item.element.offsetLeft + 15,
      item.handler.offsetTop - item.element.offsetTop + 15
    );
  }


  onDragEnd = ({ item }: IEvent) => {
    if (!this.dragging)
      return;
    item.element.style.opacity = '1';
    this.dragging = null;
    item.list.onDrop.next();
  }


  onDragEnter = ({ item }: IEvent) => {
    if (!this.dragging || this.dragging === item)
      return;
    if (item.list === this.dragging.list) {
      if (!item.element.nextSibling) {
        item.list.container.appendChild(this.dragging.element);
      } else {
        item.list.container.insertBefore(this.dragging.element,
          (item.element.nextSibling === this.dragging.element) ? item.element : item.element.nextSibling)
      }
      const drIndex = this.dragging.index;
      const ovIndex = item.index;
      item.list.items.splice(drIndex, 1);
      item.list.items.splice(ovIndex, 0, this.dragging);

      if (!item.list.model)
        return;

      const value = item.list.model[drIndex];
      item.list.model.splice(drIndex, 1);
      item.list.model.splice(ovIndex, 0, value);
    }
  }
}

import { DragDropService } from './drag-drop.service';
import { Subject } from 'rxjs';

export class Item {
  constructor(
    public handler: HTMLElement,
    public element: HTMLElement,
    public list: List
  ) {
    this.handler.draggable = true;
    this.setEvents();
  }

  setEvents() {
    this.handler.addEventListener('dragstart', this.bindEvent.bind(this));
    this.handler.addEventListener('dragend', this.bindEvent.bind(this));
    this.element.addEventListener('dragenter', this.bindEvent.bind(this));
  }

  removeEvents() {
    this.handler.removeEventListener('dragstart', this.bindEvent);
    this.handler.removeEventListener('dragend', this.bindEvent);
    this.element.removeEventListener('dragenter', this.bindEvent.bind(this));
  }

  bindEvent(event: DragEvent) {
    if (event.type === 'dragstart' || event.type === 'dragenter')
      event.stopImmediatePropagation();
    this.center[event.type].next({ item: this, event });
  }

  get index() {
    return this.list.items.indexOf(this);
  }

  get center() {
    return this.list.group.service;
  }
}

export class List {

  public onDrop = new Subject();

  constructor(
    public container: HTMLElement,
    public children: HTMLCollection,
    public items: Item[],
    public group: Group,
    public model: any[]
  ) {
    this.setItems();
  }

  setItems() {
    for (let i = 0; i < this.children.length; i++) {
      const element = this.children[i] as HTMLElement;
      const handler: HTMLElement = element.querySelector('.move');
      const item = new Item(handler, element, this);
      this.items.push(item);
    }
  }

  clear() {
    this.items.forEach(item => item.removeEvents());
  }
}

export class Group {
  constructor(
    public name: string,
    public lists: List[],
    public service: DragDropService
  ) { }

  get center() {
    return this.service;
  }

  removeList(list: List) {
    list.clear();
    this.lists.splice(this.lists.indexOf(list), 1);
  }

  clear() {
    this.lists.forEach(list => list.clear());
  }
}

export interface Groups {
  [k: string]: Group,
}

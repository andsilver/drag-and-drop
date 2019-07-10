import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropDirective } from './drag-drop.directive';
import { DragDropService } from './drag-drop.service';

@NgModule({
  declarations: [DragDropDirective],
  imports: [
    CommonModule
  ],
  exports: [
    DragDropDirective
  ]
})
export class DragDropModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DragDropModule,
      providers: [DragDropService]
    }
  }
}

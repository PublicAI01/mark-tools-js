import { Group } from 'konva/lib/Group';
import { Tool } from '../Tool';
import { TFrameType, TMarkData } from '../types/FrameMark';
import { addRectEvent } from './rectEvent';
import Konva from 'konva';
import { removeRectActive } from './utils';

export class FrameMark extends Tool {
  currFrameType?: TFrameType = null;
  limitFrame: number = -1;
  disabled: boolean = false;
  removeEventCall: () => void;
  konvaFarmesGroup: Group;
  selectedGroup: Group;

  constructor() {
    super();
  }

  async beginDraw(imgSrc: string, markData: TMarkData) {
    await this.drawBackgroundImage(imgSrc);
    this.konvaFarmesGroup = new Konva.Group({
      width: this.konvaBackgroundImage.width(),
      height: this.konvaBackgroundImage.height(),
      x: 0,
      y: 0
    });
    this.konvaContextGroup.add(this.konvaFarmesGroup);
    this.switchFrameType(null);
  }

  switchFrameType(type?: TFrameType) {
    removeRectActive(this.konvaFarmesGroup);
    this.selectedGroup = null;
    this.currFrameType = type;
    this.removeEventCall && this.removeEventCall();
    if (!this.currFrameType) {
      return this.konvaContextGroup.draggable(true);
    }
    this.konvaContextGroup.draggable(false);
    if (this.currFrameType === 'rect') {
      this.removeEventCall = addRectEvent(this);
    }
    // addRectEvent
  }

  toJson() {
    return this.konvaContextGroup.toJSON();
  }
  
  loadJson () {
    // this.konvaContextGroup.
  }
}

import { checkMobile } from '../../src/utils';
import { KonvaEventObject } from 'konva/lib/Node';
import { Stage } from 'konva/lib/Stage';
import { Rect } from 'konva/lib/shapes/Rect';
import Konva from 'konva';
import { Group } from 'konva/lib/Group';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { FrameMark } from './FrameMark';
import { calcPosition, moveStageView, removeRectActive } from './utils';

export const addRectEvent = (frameMark: FrameMark) => {
  const { konvaStage, konvaFarmesGroup, konvaContextGroup, konvaBackgroundImage } =
    frameMark;
  let isMoveing = false;
  let currRectGroup: Group;
  let currRect: Rect;
  

  const ismobile = checkMobile();
  const startEventName = 'mousedown touchstart';
  const moveEventName = 'mousemove touchmove';
  const endEventName = 'mouseup touchend';
  const startOffset = { x: 0, y: 0 };
  
  const onTouchStart = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const { target } = e;
    if (!target.parent || target.className !== 'Image') return;
    // double touch
    if ((e.evt as any)?.touches?.length === 2) {
      return;
    }
    removeRectActive(konvaFarmesGroup);
    frameMark.selectedGroup = null;
    const { offsetX, offsetY } = getPointerPosition();
    startOffset.x = offsetX;
    startOffset.y = offsetY;
    isMoveing = true;
    const color = Konva.Util.getRandomColor();
    currRectGroup = new Konva.Group({});
    currRect = new Konva.Rect({
      x: offsetX,
      y: offsetY,
      fill: color + 'B2',
      strokeEnabled: true,
      draggable: true,
      dragBoundFunc: function (pos) {
        let { x, y } = konvaContextGroup.getAbsolutePosition();
        const scaleX = konvaStage.scaleX();
        const scaleY = konvaStage.scaleY();

        const imageWidth = konvaBackgroundImage.width();
        const imageHeight = konvaBackgroundImage.height();
        const width = this.width() * this.scaleX();
        const height = this.height() * this.scaleY();

        const maxX = (imageWidth - width) * scaleX + x;
        const maxY = (imageHeight - height) * scaleY + y;
        const newX = Math.max(x, Math.min(pos.x, maxX));
        const newY = Math.max(y, Math.min(pos.y, maxY));

        return { x: newX, y: newY };
      }
    });
    // add transformation
    const transformer = new Konva.Transformer({
      nodes: [currRect],
      enabledAnchors: [
        'top-center',
        'top-left',
        'top-right',
        'middle-left',
        'middle-right',
        'bottom-left',
        'bottom-right',
        'bottom-center'
      ],
      rotateEnabled: false,
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
      resizeEnabled: false,
      borderStrokeWidth: 2,
      borderStroke: color,
      boundBoxFunc: function (oldBox, newBox) {
        const image = konvaBackgroundImage.getClientRect();
        const imgWidth = (image.x + image.width) * konvaStage.scaleX();
        const boxWidth = (newBox.x + newBox.width) * konvaStage.scaleX();
        const imgHeight = (image.y + image.height) * konvaStage.scaleY();
        const boxHeight = (newBox.y + newBox.height) * konvaStage.scaleY();
        const width = boxWidth > imgWidth ? oldBox.width : Math.min(image.width, newBox.width);
        const height =
          boxHeight > imgHeight ? oldBox.height : Math.min(image.height, newBox.height);

        const limitedBox = {
          x: Math.max(image.x, newBox.x),
          y: Math.max(image.y, newBox.y),
          width,
          height,
          rotation: newBox.rotation
        };

        return limitedBox;
      }

      // anchor
    });
    currRect.on('click tap', onRectClick);
    currRect.on('dragmove', onRectDragMove);
    transformer.on('transform', onTransform);
    currRectGroup.add(currRect, transformer);
    konvaFarmesGroup.add(currRectGroup);
  };

  const onTouchMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const { target } = e;
    if (!target.parent) return;
    if (!isMoveing) return;
    if ((e.evt as any)?.touches?.length === 2) {
      return;
    }
    const { offsetX, offsetY } = getPointerPosition();
    const { width, height, x, y } = calcPosition(startOffset, offsetX, offsetY);
    currRect.width(width);
    currRect.height(height);
    currRect.x(x);
    currRect.y(y);
    moveStageView(konvaStage);
  };

  const onTouchEnd = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const { offsetX, offsetY } = getPointerPosition();
    isMoveing = false;
    if (startOffset.x === offsetX && startOffset.y === offsetY && currRectGroup) {
      currRectGroup.remove();
    }
    currRectGroup = null;
    currRect = null;
    setTimeout(() => {
      konvaContextGroup.draggable(false);
    }, 10);
  };

  const onRectDragMove = () => {
    moveStageView(konvaStage);
  };

  const onTransform = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    moveStageView(konvaStage);
  };

  const onRectClick = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    removeRectActive(konvaFarmesGroup);
    frameMark.selectedGroup = e.currentTarget.parent as Group;
    const transformer = e.currentTarget.parent.getChildren((item) => {
      return item.className === 'Transformer';
    })[0] as Transformer;
    transformer.resizeEnabled(true);
    transformer.rotateEnabled(true);
    e.currentTarget.parent.moveToTop();
  };

  const getPointerPosition = () => {
    const pointerPos = konvaStage.getPointerPosition();
    const layerPos = konvaContextGroup.getAbsolutePosition();
    const offsetX = (pointerPos.x - layerPos.x) / konvaStage.scaleX();
    const offsetY = (pointerPos.y - layerPos.y) / konvaStage.scaleY();
    return { offsetX, offsetY };
  };

  konvaStage.on(startEventName, onTouchStart);
  konvaStage.on(moveEventName, onTouchMove);
  konvaStage.on(endEventName, onTouchEnd);

  return () => {
    konvaStage.off(startEventName, onTouchStart);
    konvaStage.off(moveEventName, onTouchMove);
    konvaStage.off(endEventName, onTouchEnd);
  };
};


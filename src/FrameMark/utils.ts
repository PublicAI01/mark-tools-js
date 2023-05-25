import { Group } from 'konva/lib/Group';
import { Stage } from 'konva/lib/Stage';
import { Transformer } from 'konva/lib/shapes/Transformer';

export const removeRectActive = (konvaRectsGroup: Group) => {
  if (!konvaRectsGroup) return;
  for (const group of konvaRectsGroup.children) {
    for (const child of (group as Group).children) {
      if (child.className === 'Transformer') {
        (child as Transformer).resizeEnabled(false);
        (child as Transformer).rotateEnabled(false);
      }
    }
  }
};

export function checkNearBoundary(stage: Stage) {
  const stageWidth = stage.width();
  const stageHeight = stage.height();
  const { x, y } = stage.getPointerPosition();
  const threshold = 50;

  // is check near boundary
  const nearLeftBoundary = x - threshold <= 0;
  const nearRightBoundary = x + threshold >= stageWidth;
  const nearTopBoundary = y - threshold <= 0;
  const nearBottomBoundary = y + threshold >= stageHeight;

  if (nearLeftBoundary) {
    return 'left';
  } else if (nearRightBoundary) {
    return 'right';
  } else if (nearTopBoundary) {
    return 'top';
  } else if (nearBottomBoundary) {
    return 'bottom';
  }

  return null;
}

// move position
export function moveStageView(stage: Stage) {
  const direction = checkNearBoundary(stage);
  if (!direction) return;
  const step = 5; // move step
  const stagePosition = stage.position();
  const offsetX = stagePosition.x;
  const offsetY = stagePosition.y;

  // update direction position
  if (direction === 'right') {
    stage.position({ x: offsetX - step, y: offsetY });
  } else if (direction === 'left') {
    stage.position({ x: offsetX + step, y: offsetY });
  } else if (direction === 'bottom') {
    stage.position({ x: offsetX, y: offsetY - step });
  } else if (direction === 'top') {
    stage.position({ x: offsetX, y: offsetY + step });
  }

  stage.batchDraw();
}

export const calcPosition = (startOffset: { x: number; y: number }, x: number, y: number) => {
  const { x: startX, y: startY } = startOffset;
  const width = Math.abs(x - startX),
    height = Math.abs(y - startY),
    mx = Math.min(x, startX),
    my = Math.min(y, startY);
  return { width, height, x: mx, y: my };
};

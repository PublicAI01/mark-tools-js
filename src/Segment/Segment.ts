import { Line } from 'konva/lib/shapes/Line';
import { Tool } from '../Tool';
import { THandledSegmentation, TImageCategorysData, TImageData } from '../types/Segment';
import { splitSegmentation } from '../utils/utils';
import Konva from 'konva';

export class SegmentMark extends Tool {
  imageData: TImageData;

  constructor() {
    super();
  }

  async beginDraw(imageData: TImageData) {
    this.imageData = JSON.parse(JSON.stringify(imageData));
    this._handleSegmentation();
    await this.drawBackgroundImage(this.imageData.url);
    this._drawImagePolygon();
  }

  _drawImagePolygon() {
    this._foreachSegmentation((handledSeg, points, { fillColor }) => {
      const group = new Konva.Group({});
      // animation line
      const stroke = new Konva.Line({
        points,
        stroke: 'rgba(255, 255, 255, 0.7)',
        strokeWidth: 1,
        strokeEnabled: false,
        closed: true,
        lineCap: 'round',
        dash: [5, 5]
      });

      const fillPolygon = new Konva.Line({
        points,
        fill: fillColor + 'B2',
        closed: true
      });

      group.add(fillPolygon);
      group.add(stroke);

      const anim = new Konva.Animation((frame) => {
        const offset = frame.time / 50; // The offset of the ant line can be adjusted according to needs
        stroke.dashOffset(offset);
      }, this.konvaLayer);

      const handleTap = () => {
        handledSeg.isChecked = !handledSeg.isChecked;
        stroke.strokeEnabled(handledSeg.isChecked);
        if (handledSeg.isChecked) {
          anim.start();
        } else {
          anim.stop();
        }
        this._onSelect?.(handledSeg, fillPolygon, this.imageData);
      };

      group.on('click tap', handleTap);
      this.konvaContextGroup.add(group);
    });
  }

  /**
   * handle image data
   *
   */
  _handleSegmentation() {
    const { categorys } = this.imageData;
    for (const category of categorys) {
      const { segmentation } = category;
      const splitedSegmentation = splitSegmentation(segmentation);
      category.fillColor = Konva.Util.getRandomColor();
      category.handledSegmentation = splitedSegmentation.map<THandledSegmentation>(
        (splitedSegmentation: any) => ({
          splitedSegmentation,
          isChecked: false
        })
      );
    }
  }

  /**
   * foreach segmentation
   * @param segmentationCall
   */
  _foreachSegmentation(
    segmentationCall: (
      handledSeg: THandledSegmentation,
      segs: number[],
      category: TImageCategorysData
    ) => void
  ) {
    const { categorys } = this.imageData;
    for (const category of categorys) {
      const { segmentation, handledSegmentation } = category;
      let i = 0;
      for (const handledSeg of handledSegmentation) {
        segmentationCall && segmentationCall(handledSeg, segmentation[i], category);
        i++;
      }
    }
  }

  _onSelect: (handledSeg: THandledSegmentation, line: Line, imageData: TImageData) => void;
}

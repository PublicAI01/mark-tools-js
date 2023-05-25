import { FrameMark, SegmentMark } from '../src/index'
import './index.less'
// import testData from './assets/test.json'
import png2 from './assets/2.jpg'
console.log(png2)

const mark = new FrameMark()
window.mark = mark
// mark.beginDraw(testData);

mark.beginDraw(png2).then(() => {
  // mark.switchFrameType('rect')
})

window.addEventListener('load', () => {
  document.body.style.height = window.innerHeight + 'px'
})

window.onRect = () => {
  mark.switchFrameType('rect')
}

window.onPointer = () => {
  mark.switchFrameType()
}

window.onRemove = () => {
  mark.selectedGroup.remove()
}

import { FrameMark, SegmentMark } from '../src/index'
import './index.less'
import testData from './assets/test.json'
import png2 from './assets/2.jpg'

testData.url = png2

console.log(testData, png2)

const mark = new SegmentMark()
window.mark = mark
mark.beginDraw(testData)

// mark.beginDraw(png2).then(() => {
//   // mark.switchFrameType('rect')
// })

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

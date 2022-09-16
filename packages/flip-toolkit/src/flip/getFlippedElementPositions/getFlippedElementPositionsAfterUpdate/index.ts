import { addTupleToObject, getRects, getAllElements } from '../utilities'
import { FlipCallbacks } from '../../../types'


import {
  FlippedElementPositionsAfterUpdate,
  FlippedElementPositionDatumAfterUpdate
} from './types'

const getFlippedElementPositionsAfterUpdate = ({
  element,
  portalKey,
  flipCallbacks
}: {
  element: HTMLElement
  portalKey?: string
  flipCallbacks?: FlipCallbacks
}): FlippedElementPositionsAfterUpdate => {




  const candidateFlippedElements = getAllElements(element, portalKey)
  let flippedElements:HTMLElement[] = []
  candidateFlippedElements
    .map(
      el => {

        // console.log(el, flipCallbacks?.[el.dataset.flipId!])
        let ret:boolean = !!(flipCallbacks &&
                !flipCallbacks?.[el.dataset.flipId!] || 
                (flipCallbacks?.[el.dataset.flipId!].shouldFlipIgnore === undefined || !flipCallbacks?.[el.dataset.flipId!].shouldFlipIgnore?.())
              )

        if (ret) {
          flippedElements.push(el)
        } 
      }
    )

  // console.log("after", flippedElements)
  const positionArray = getRects(flippedElements).map(
    ([child, childBCR]) => {
      const computedStyle = window.getComputedStyle(child)
      return [
        child.dataset.flipId,
        {
          element: child,
          rect: childBCR,
          opacity: parseFloat(computedStyle.opacity!),
          transform: computedStyle.transform
        }
      ]
    }
  ) as [string, FlippedElementPositionDatumAfterUpdate][]

  return positionArray.reduce(addTupleToObject, {})
}

export default getFlippedElementPositionsAfterUpdate

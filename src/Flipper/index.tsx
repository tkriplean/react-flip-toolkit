import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'
import onFlipKeyUpdate from '../flip'
import getFlippedElementPositionsBeforeUpdate from '../flip/getFlippedElementPositions/getFlippedElementPositionsBeforeUpdate'
import {
  FlipperProps,
  InProgressAnimations,
  FlipCallbacks,
  GestureParams
} from './types'
import { FlippedElementPositionsBeforeUpdateReturnVals } from '../flip/getFlippedElementPositions/getFlippedElementPositionsBeforeUpdate/types'
import { DATA_NO_TOUCH } from '../constants'
export const FlipContext = createContext({} as FlipCallbacks)
export const PortalContext = createContext('portal')
export const GestureContext = createContext({} as GestureParams)

const styleId = `react-flip-toolkit-${DATA_NO_TOUCH}`

class Flipper extends Component<FlipperProps> {
  static defaultProps = {
    applyTransformOrigin: true,
    element: 'div',
    retainTransform: false
  }

  private isGestureControlled: boolean = false
  private isGestureInitiated: boolean = false

  private inProgressAnimations: InProgressAnimations = {}
  private flipCallbacks: FlipCallbacks = {}
  private el?: HTMLElement = undefined

  setIsGestureInitiated = () => {
    this.isGestureInitiated = true
  }

  componentDidMount() {
    try {
      if (document.getElementById(styleId)) return
      const css = `[${DATA_NO_TOUCH}] { touch-action: none; }`
      const style = document.createElement('style')
      style.appendChild(document.createTextNode(css))
      style.type = 'text/css'
      style.id = styleId
      document.head.appendChild(style)
    } catch (e) {
      // if this errors, gestures aren't gonna work great on mobile
    }
  }

  getSnapshotBeforeUpdate(prevProps: FlipperProps) {
    // a roundabout method to fix issues with gesture ==> nongesture cancellations
    if (this.isGestureInitiated) {
      this.isGestureControlled = true
      this.isGestureInitiated = false
    } else {
      this.isGestureControlled = false
    }
    if (prevProps.flipKey !== this.props.flipKey && this.el) {
      return getFlippedElementPositionsBeforeUpdate({
        element: this.el,
        // if onExit callbacks exist here, we'll cache the DOM node
        flipCallbacks: this.flipCallbacks,
        inProgressAnimations: this.inProgressAnimations,
        portalKey: this.props.portalKey
      })
    }
    return null
  }

  componentDidUpdate(
    prevProps: FlipperProps,
    _prevState: any,
    cachedData: FlippedElementPositionsBeforeUpdateReturnVals
  ) {
    if (this.props.flipKey !== prevProps.flipKey && this.el) {
      onFlipKeyUpdate({
        flippedElementPositionsBeforeUpdate: cachedData.flippedElementPositions,
        cachedOrderedFlipIds: cachedData.cachedOrderedFlipIds,
        isGestureControlled: this.isGestureControlled,
        containerEl: this.el,
        inProgressAnimations: this.inProgressAnimations,
        flipCallbacks: this.flipCallbacks,
        applyTransformOrigin: this.props.applyTransformOrigin,
        spring: this.props.spring,
        debug: this.props.debug,
        portalKey: this.props.portalKey,
        staggerConfig: this.props.staggerConfig,
        handleEnterUpdateDelete: this.props.handleEnterUpdateDelete,
        // typescript doesn't recognize defaultProps (?)
        retainTransform: this.props.retainTransform!,
        decisionData: {
          prev: prevProps.decisionData,
          current: this.props.decisionData
        },
        onComplete: this.props.onComplete
      })
    }
  }

  render() {
    const { element, className, portalKey } = this.props
    const Element = element

    let flipperMarkup = (
      <GestureContext.Provider
        value={{
          inProgressAnimations: this.inProgressAnimations,
          setIsGestureInitiated: this.setIsGestureInitiated
        }}
      >
        <FlipContext.Provider value={this.flipCallbacks}>
          {/*
        // @ts-ignore */}
          <Element
            className={className}
            ref={(el: HTMLElement) => (this.el = el)}
          >
            {this.props.children}
          </Element>
        </FlipContext.Provider>
      </GestureContext.Provider>
    )

    if (portalKey) {
      flipperMarkup = (
        <PortalContext.Provider value={portalKey}>
          {flipperMarkup}
        </PortalContext.Provider>
      )
    }

    return flipperMarkup
  }
}

if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore
  Flipper.propTypes = {
    flipKey: PropTypes.any,
    children: PropTypes.node.isRequired,
    spring: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    applyTransformOrigin: PropTypes.bool,
    debug: PropTypes.bool,
    element: PropTypes.string,
    className: PropTypes.string,
    portalKey: PropTypes.string,
    staggerConfig: PropTypes.object,
    decisionData: PropTypes.any,
    handleEnterUpdateDelete: PropTypes.func,
    retainTransform: PropTypes.bool,
    onComplete: PropTypes.func,
    isGestureControlled: PropTypes.bool
  }
}

export default Flipper

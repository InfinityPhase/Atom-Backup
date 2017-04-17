/* @flow */

import React from 'react'
import { openExternally } from '../helpers'
import type TooltipDelegate from './delegate'
import type { MessageLegacy } from '../types'

const NEWLINE = /\r\n|\n/
let MESSAGE_NUMBER = 0

class MessageElement extends React.Component {
  props: {
    message: MessageLegacy,
    delegate: TooltipDelegate,
  };
  state: {
    multiLineShow: boolean,
  } = {
    multiLineShow: false,
  };
  componentDidMount() {
    this.props.delegate.onShouldUpdate(() => {
      this.setState({})
    })
    this.props.delegate.onShouldExpand(() => {
      this.setState({ multiLineShow: true })
    })
    this.props.delegate.onShouldCollapse(() => {
      this.setState({ multiLineShow: false })
    })
  }
  render() {
    return NEWLINE.test(this.props.message.text || '') ? this.renderMultiLine() : this.renderSingleLine()
  }
  renderSingleLine() {
    const { message, delegate } = this.props

    const number = ++MESSAGE_NUMBER
    const elementID = `linter-message-${number}`
    const isElement = message.html && typeof message.html === 'object'
    if (isElement) {
      setImmediate(function() {
        const element = document.getElementById(elementID)
        if (element) {
          // $FlowIgnore: This is an HTML Element :\
          element.appendChild(message.html.cloneNode(true))
        } else {
          console.warn('[Linter] Unable to get element for mounted message', number, message)
        }
      })
    }

    return (<linter-message class={message.severity}>
      { delegate.showProviderName ? `${message.linterName}: ` : '' }
      <span id={elementID} dangerouslySetInnerHTML={!isElement && message.html ? { __html: message.html } : null}>
        { message.text }
      </span>
      {' '}
      <a href="#" onClick={() => openExternally(message)}>
        <span className="icon icon-link linter-icon" />
      </a>
    </linter-message>)
  }

  renderMultiLine() {
    const { message, delegate } = this.props

    const text = message.text ? message.text.split(NEWLINE) : []
    const chunks = text.map(entry => entry.trim()).map((entry, index) => entry.length && <span className={index !== 0 && 'linter-line'}>{entry}</span>).filter(e => e)

    return (<linter-message class={message.severity}>
      <a href="#" onClick={() => this.setState({ multiLineShow: !this.state.multiLineShow })}>
        <span className={`icon linter-icon icon-${this.state.multiLineShow ? 'chevron-down' : 'chevron-right'}`} />
      </a>
      { delegate.showProviderName ? `${message.linterName}: ` : '' }
      { chunks[0] }
      {' '}
      { this.state.multiLineShow && chunks.slice(1) }
    </linter-message>)
  }
}

module.exports = MessageElement

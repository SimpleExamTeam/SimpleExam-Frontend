import { createVNode, render } from 'vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

let messageInstance = null

const createMessage = (options) => {
  const container = document.createElement('div')
  
  const vnode = createVNode(ErrorMessage, {
    ...options,
    onDestroy: () => {
      render(null, container)
      document.body.removeChild(container)
      messageInstance = null
    }
  })
  
  render(vnode, container)
  document.body.appendChild(container)
  
  messageInstance = vnode
  return vnode
}

export const message = {
  error(message, duration = 3000) {
    if (messageInstance) {
      messageInstance.component.props.message = message
      messageInstance.component.props.type = 'error'
    } else {
      createMessage({
        message,
        type: 'error',
        duration
      })
    }
  },
  
  success(message, duration = 3000) {
    if (messageInstance) {
      messageInstance.component.props.message = message
      messageInstance.component.props.type = 'success'
    } else {
      createMessage({
        message,
        type: 'success',
        duration
      })
    }
  },
  
  info(message, duration = 3000) {
    if (messageInstance) {
      messageInstance.component.props.message = message
      messageInstance.component.props.type = 'info'
    } else {
      createMessage({
        message,
        type: 'info',
        duration
      })
    }
  }
} 
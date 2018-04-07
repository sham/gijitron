import * as React from 'react'
import ReactDOM from 'react-dom'

import Start from './pages/start'

const render = (Component) => {
  ReactDOM.render(
    <Component />,
    document.getElementById('parcel-root')
  )
}

render(Start)

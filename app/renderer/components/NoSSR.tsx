import * as React from 'react'

interface IProps {
  children: any
  onSSR?: any
}

interface IState {
  canRender: boolean
}

export default class NoSSR extends React.Component<IProps, IState> {
  constructor(args) {
    super(args)
    this.state = {
      canRender: false
    }
  }

  public componentDidMount() {
    this.setState({ canRender: true })
  }

  public render() {
    const DefaultOnSSR = () => null
    const { children, onSSR = <DefaultOnSSR /> } = this.props
    const { canRender } = this.state

    return canRender ? children : onSSR
  }
}

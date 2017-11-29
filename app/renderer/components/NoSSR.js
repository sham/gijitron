import React from 'react';
import PropTypes from 'prop-types';

export default class NoSSR extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      canRender: false
    };
  }
  
  componentDidMount() {
    this.setState({ canRender: true });
  }
  
  render() {
    const DefaultOnSSR = () => null;
    const { children, onSSR = <DefaultOnSSR /> } = this.props;
    const { canRender } = this.state;
  
    return canRender ? children : onSSR;
  }
}
NoSSR.propTypes = {
  children: PropTypes.element.isRequired,
  onSSR: PropTypes.element
};
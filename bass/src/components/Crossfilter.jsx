import React, { Component, Fragment } from 'react';
import crossfilter from 'crossfilter2';
import { createContext, useContext } from 'react';
import dc from 'dc';

const NdxContext = createContext();

const useCrossfilter = () => useContext(NdxContext);

export default class Crossfilter extends Component {
  constructor() {
    super();

    this.state = {
      ndx: crossfilter(),
      i: 0,
    };
    // need to make sure dc.renders are triggered.
  }

  componentDidMount() {
    this.props.data().then(data => {
      // Have to do data.default, as webpack's native json loading will import an object instead of array here.
      this.state.ndx.add(data.default);
      dc.renderlet(() => this.setState({ i: this.state.i + 1}));
      // dc.disableTransitions = true;
      dc.redrawAll()
      // dc.disableTransitions = false;
    });
  }

  render() {
    return (<NdxContext.Provider value={this.state}>
      <Fragment children={this.props.children} />
    </NdxContext.Provider>);
  }
}

export {
  useCrossfilter,
  NdxContext,
}

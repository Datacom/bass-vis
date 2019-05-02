import React from 'react';
import { Row, Col } from 'reactstrap';
import Crossfilter from '../../components/Crossfilter';
import * as Charts from '../charts';
import AgencyCharts from './AgencyCharts';
import SubcostCharts from './SubcostCharts';

const Visualisation = () => (<Crossfilter data={() => import(/* webpackChunkName: "ASVisData" */ '../../data/data.json').then(d => d.default)}>
  <Row>
    <Col>
      <div className='borderedCard'>
        <AgencyCharts />
      </div>
    </Col>
  </Row>
  <Row>
    <Col xs={12} sm={4}>
      <div className='borderedCard'>
        <Row>
          <Charts.Year className='col' />
          <Charts.Cohort className='col' />
        </Row>
        <Row>
          <Charts.Metric className='col' />
        </Row>
      </div>
    </Col>
    <Col xs={12} sm={8}>
      <div className='borderedCard'>
        <SubcostCharts />
      </div>
    </Col>
  </Row>
</Crossfilter>);

export default Visualisation;

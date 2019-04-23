import React from 'react';
import { Row, Col } from 'reactstrap';
import Crossfilter from '../../components/Crossfilter';
import * as Charts from './charts';

const Visualisation = () => (<Crossfilter data={() => import('../../data/data.json').then(d => d.default)}>
  <Row>
    <Col>
      <div className='borderedCard'>
        <Charts.Agencies />
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
        <Charts.Subcosts />
      </div>
    </Col>
  </Row>
</Crossfilter>);

export default Visualisation;

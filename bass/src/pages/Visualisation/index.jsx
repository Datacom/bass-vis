import React from 'react';
import { Row, Col } from 'reactstrap';
import Crossfilter from '../../components/Crossfilter';
import { YearChart, CohortChart } from './charts';

const Visualisation = () => (<Crossfilter data={() => import('../../data/data.json')}>
  <Row>
    <Col>
      <div className='borderedCard'>
        <legend>Agencies (Total cost of A&S functions by cohort size)</legend>
      </div>
    </Col>
  </Row>
  <Row>
    <Col xs={12} sm={4}>
      <div className='borderedCard'>
        <Row>
          <Col>
            <legend>Year</legend>
            <YearChart />
          </Col>
          <Col>
            <legend>Cohort</legend>
            <CohortChart />
          </Col>
        </Row>
        <Row>
          <Col>
            <legend>Metric</legend>
          </Col>
        </Row>
      </div>
    </Col>
    <Col xs={12} sm={8}>
      <div className='borderedCard'>
        <legend>Subcosts</legend>
      </div>
    </Col>
  </Row>
  <Row>
    <Col>
      <div className='borderedCard'>
        <legend>FTE vs Expenditure (by cohort size)</legend>
      </div>
    </Col>
  </Row>
</Crossfilter>);

export default Visualisation;

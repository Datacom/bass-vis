import React from 'react';
import { Row, Col } from 'reactstrap';

const Visualisation = () => (<>
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
          </Col>
          <Col>
            <legend>Cohort</legend>
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
</>);

export default Visualisation;

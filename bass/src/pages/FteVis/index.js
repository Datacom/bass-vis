import React from 'react';
import { Row, Col } from 'reactstrap';
import { scaleLinear, format } from 'd3';
import Crossfilter from '../../components/Crossfilter';
import data from './data';
import { Year, Cohort } from '../ASVis/charts';
import SplitChart from '../../components/SplitChart';
import orgData from '../../data/orgData.json';
import { orgColor } from '../ASVis/AgencyTitle';

const Visualisation = () => (<Crossfilter data={() => Promise.resolve(data())}>
  <Row>
    <Col xs={12} sm={2}>
      <div className='borderedCard'>
        <Row>
          <Year className='col' />
        </Row>
        <Row>
          <Cohort className='col' />
        </Row>
      </div>
    </Col>
    <Col xs={12} sm={10}>
      <div className='borderedCard'>
        <SplitChart
          chartTitle='FTE vs Expenditure (by cohort size)'
          dimFunc={d => d.org}
          reduceSum={d => d.value}
          label={d => orgData[d.key].full_name}
          splitFn={d => orgData[d.key].cohort}
          groups={['Small', 'Medium', 'Large']}
          className='col-12'
          type='bubble'
          x={scaleLinear()}
          y={scaleLinear()}
          keyAccessor={d => d.value.expenditure}
          valueAccessor={d => Number(d.value.fte.toFixed(2))}
          colorCalculator={d => orgColor(d.key)}
          radiusValueAccessor={() => 2.5}
          on={{
            'preRender.init': chart => {
              chart.xAxis().ticks(4).tickFormat(d => format('$.2s')(d).replace(/G/, 'B'));
              chart.yAxis().ticks(4).tickFormat(d => format('.2s')(d));
            }
          }}
          clipPadding={10}
          symbolSize={8}
          title={d => (d.key+"\n\n"+
                    "Total Organisational FTE: "+format('.2s')(d.value.fte)+"\n"+
                    "Total Expenditure: "+format('$,')(d.value.expenditure))}
          reduceFns={[
            (p, v) => {
              p.fte += v.fte;
              p.expenditure += v.value;
              return p;
            },
            (p, v) => {
              p.fte -= v.fte;
              p.expenditure -= v.value;
              return p;
            },
            () => ({ fte: 0, expenditure: 0 }),
          ]}
          height={235}
        />
      </div>
    </Col>
  </Row>
</Crossfilter>);

export default Visualisation;

import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavItem, NavLink, NavbarBrand, CustomInput, Container } from 'reactstrap';
import { Switch, Route, Redirect, NavLink as RRNavLink } from "react-router-dom";
import ASVis from './pages/ASVis';
import FteVis from './pages/FteVis';

const AppBar = () => {
  const [ darkTheme, setDarkTheme ] = useState(true);
  useEffect(() => {
    document.body.id = darkTheme ? 'dark' : '';
  });

  return (
    <Navbar dark={darkTheme} light={!darkTheme} color={darkTheme ? 'dark' : 'light'} expand>
      <NavbarBrand tag="span">BASS</NavbarBrand>
      <Nav navbar>
        <NavItem><NavLink to="/as_functions" activeClassName="active" tag={RRNavLink}>A&S Functions</NavLink></NavItem>
        <NavItem><NavLink to="/fte_expenditure" activeClassName="active" tag={RRNavLink}>FTE vs Expenditure</NavLink></NavItem>
      </Nav>
      <Nav className='ml-auto'>
        <NavItem>
          <CustomInput id="theme-switch" type="switch" checked={darkTheme} onChange={() => setDarkTheme(!darkTheme)} label={`${darkTheme ? 'Dark' : 'Light'} Theme`} />
        </NavItem>
      </Nav>
    </Navbar>
  );
};

const App = () => {
  return (
    <>
      <AppBar />
      <Container fluid>
        <Switch>
          <Redirect exact from='/' to='/as_functions'/>
          <Route path="/as_functions" component={ASVis} />
          <Route path="/fte_expenditure" component={FteVis} />
          <Route component={() => '404: Page not found'} />
        </Switch>
      </Container>
    </>
  );
};

export default App;

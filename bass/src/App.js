import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavItem, NavbarBrand, CustomInput, Container } from 'reactstrap';
import Visualisation from './pages/Visualisation';

const AppBar = () => {
  const [ darkTheme, setDarkTheme ] = useState(true);
  useEffect(() => {
    document.body.id = darkTheme ? 'dark' : '';
  });

  return (
    <Navbar dark={darkTheme} light={!darkTheme} color={darkTheme ? 'dark' : 'light'}>
      <NavbarBrand tag="span">BASS</NavbarBrand>
      <Nav navbar>
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
        <Visualisation />
      </Container>
    </>
  );
};

export default App;

import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" className="main-navbar">
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/">
          TaskDistributor
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="main-navbar-nav" />
        <BootstrapNavbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/tasks">Tareas</Nav.Link>
            <Nav.Link as={Link} to="/gantt">Gantt</Nav.Link>
            <Nav.Link as={Link} to="/teams/capacity">Capacidad Equipos</Nav.Link>
            <Nav.Link as={Link} to="/alerts">Alertas</Nav.Link>
          </Nav>
          {user && (
            <Nav>
              <Nav.Item className="d-flex align-items-center me-3 text-white">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                {user.name} ({user.role})
              </Nav.Item>
              <Button 
                variant="outline-light" 
                onClick={logout} 
                className="d-flex align-items-center"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Cerrar sesión
              </Button>
            </Nav>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 
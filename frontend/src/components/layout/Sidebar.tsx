import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTasks, 
  faChartGantt, 
  faChartLine,
  faBell,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h5>Menú</h5>
      </div>
      <Nav className="flex-column">
        <Nav.Link as={NavLink} to="/dashboard" className="sidebar-link">
          <FontAwesomeIcon icon={faChartLine} className="sidebar-icon" />
          Dashboard
        </Nav.Link>
        
        <Nav.Link as={NavLink} to="/tasks" className="sidebar-link">
          <FontAwesomeIcon icon={faTasks} className="sidebar-icon" />
          Tareas
        </Nav.Link>
        
        <Nav.Link as={NavLink} to="/gantt" className="sidebar-link">
          <FontAwesomeIcon icon={faChartGantt} className="sidebar-icon" />
          Gantt
        </Nav.Link>
        
        <Nav.Link as={NavLink} to="/teams/capacity" className="sidebar-link">
          <FontAwesomeIcon icon={faUsers} className="sidebar-icon" />
          Capacidad Equipos
        </Nav.Link>
        
        <Nav.Link as={NavLink} to="/alerts" className="sidebar-link">
          <FontAwesomeIcon icon={faBell} className="sidebar-icon" />
          Alertas
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar; 
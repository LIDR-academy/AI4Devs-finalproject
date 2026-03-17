import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import TaskList from '../components/tasks/TaskList';

const TaskManagement: React.FC = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <TaskList />
        </Col>
      </Row>
    </Container>
  );
};

export default TaskManagement; 
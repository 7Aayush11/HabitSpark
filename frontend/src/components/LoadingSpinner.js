import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Container className="d-flex justify-content-center align-items-center my-5">
      <Spinner animation="border" role="status" variant="primary" className="me-2" />
      <span>{message}</span>
    </Container>
  );
};

export default LoadingSpinner; 
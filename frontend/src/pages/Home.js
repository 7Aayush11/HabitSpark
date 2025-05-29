import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold">Build Better Habits, Build a Better Life</h1>
              <p className="lead">
                HabitSpark helps you create and maintain positive habits, inspired by the principles of James Clear's "Atomic Habits."
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/register" variant="light" size="lg">
                  Get Started
                </Button>
                <Button as={Link} to="/login" variant="outline-light" size="lg">
                  Login
                </Button>
              </div>
            </Col>
            <Col md={6} className="text-center">
              {/* Placeholder for an image */}
              <div className="bg-light rounded p-5 text-primary">
                <h3>Habit Tracker Illustration</h3>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="my-5">
        <h2 className="text-center mb-5">Key Features</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="mb-3 text-primary">
                  <i className="bi bi-calendar-check" style={{ fontSize: "2rem" }}></i>
                </div>
                <Card.Title>Habit Tracking</Card.Title>
                <Card.Text>
                  Create custom habits, set frequency, and track your progress over time.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="mb-3 text-primary">
                  <i className="bi bi-graph-up" style={{ fontSize: "2rem" }}></i>
                </div>
                <Card.Title>Progress Visualization</Card.Title>
                <Card.Text>
                  Watch your progress with visual cues and Aura points to keep you motivated.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="mb-3 text-primary">
                  <i className="bi bi-lightbulb" style={{ fontSize: "2rem" }}></i>
                </div>
                <Card.Title>Habit Insights</Card.Title>
                <Card.Text>
                  Get insights into your habit-building journey and identify areas for improvement.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Quote Section */}
      <div className="bg-light py-5">
        <Container>
          <Row className="justify-content-center text-center">
            <Col md={8}>
              <blockquote className="blockquote">
                <p className="mb-3 fs-4">
                  "You do not rise to the level of your goals. You fall to the level of your systems."
                </p>
                <footer className="blockquote-footer">
                  James Clear, <cite title="Source Title">Atomic Habits</cite>
                </footer>
              </blockquote>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Call to Action */}
      <Container className="my-5 text-center">
        <h2>Ready to Build Better Habits?</h2>
        <p className="lead mb-4">Join HabitSpark today and start your journey to positive change.</p>
        <Button as={Link} to="/register" variant="primary" size="lg">
          Get Started for Free
        </Button>
      </Container>
    </div>
  );
};

export default Home; 
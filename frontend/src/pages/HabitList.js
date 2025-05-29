import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getHabits } from '../services/api';
import HabitCard from '../components/HabitCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HabitList = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await getHabits();
        setHabits(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch habits');
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your habits..." />;
  }

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col md={8}>
          <h2>My Habits</h2>
        </Col>
        <Col md={4} className="text-end">
          <Button as={Link} to="/habits/new" variant="primary">
            Create New Habit
          </Button>
        </Col>
      </Row>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {habits.length === 0 ? (
        <div className="text-center p-5">
          <p>You haven't created any habits yet.</p>
          <Button as={Link} to="/habits/new" variant="primary">Create Your First Habit</Button>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {habits.map(habit => (
            <Col key={habit.id}>
              <HabitCard habit={habit} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default HabitList; 
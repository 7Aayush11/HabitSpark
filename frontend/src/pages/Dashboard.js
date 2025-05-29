import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getHabits, completeHabit } from '../services/api';
import { useAuth } from '../context/AuthContext';
import HabitCard from '../components/HabitCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [auraPoints, setAuraPoints] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await getHabits();
        setHabits(response.data);
        
        // Calculate total aura points
        const totalPoints = response.data.reduce((total, habit) => {
          return total + (habit.aura_points || 1) * (habit.completions?.length || 0);
        }, 0);
        
        setAuraPoints(totalPoints);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch habits');
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  const handleCompleteHabit = async (habitId) => {
    try {
      await completeHabit(habitId);
      
      // Update the habits state
      setHabits(habits.map(habit => {
        if (habit.id === habitId) {
          const updatedHabit = { ...habit };
          if (!updatedHabit.completions) {
            updatedHabit.completions = [];
          }
          updatedHabit.completions.push({ completed_at: new Date() });
          
          // Update aura points
          setAuraPoints(prevPoints => prevPoints + (habit.aura_points || 1));
          
          return updatedHabit;
        }
        return habit;
      }));
    } catch (err) {
      setError('Failed to complete habit');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  // Filter habits for today
  const todayHabits = habits.filter(habit => {
    // Simple filter for daily habits - can be enhanced for weekly habits etc.
    return habit.frequency === 'daily';
  });

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h2>Dashboard</h2>
          <p>Welcome back, {currentUser?.username || 'User'}!</p>
        </Col>
      </Row>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Aura Points</Card.Title>
              <Card.Text className="display-4">{auraPoints}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Habits</Card.Title>
              <Card.Text className="display-4">{habits.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Habits for Today</Card.Title>
              <Card.Text className="display-4">{todayHabits.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <h3>Today's Habits</h3>
          {todayHabits.length === 0 ? (
            <div className="text-center p-4">
              <p>You don't have any habits for today.</p>
              <Button as={Link} to="/habits/new" variant="primary">Create a Habit</Button>
            </div>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {todayHabits.map(habit => (
                <Col key={habit.id}>
                  <HabitCard 
                    habit={habit} 
                    onComplete={handleCompleteHabit} 
                  />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 
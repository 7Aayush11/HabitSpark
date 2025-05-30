import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { createHabit, updateHabit, getHabits } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const HabitForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    aura_points: 1
  });
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHabit = async () => {
      if (isEditing) {
        try {
          const response = await getHabits();
          const habit = response.data.find(h => h.id === parseInt(id));
          
          if (habit) {
            setFormData({
              name: habit.name,
              description: habit.description || '',
              frequency: habit.frequency,
              aura_points: habit.aura_points || 1
            });
          } else {
            setError('Habit not found');
          }
          
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch habit details');
          setLoading(false);
        }
      }
    };

    fetchHabit();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'aura_points' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await updateHabit(id, formData);
      } else {
        await createHabit(formData);
      }
      navigate('/habits');
    } catch (err) {
      setError(isEditing ? 'Failed to update habit' : 'Failed to create habit');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading habit details..." />;
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h2>{isEditing ? 'Edit Habit' : 'Create New Habit'}</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="habitName">
              <Form.Label>Habit Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="e.g., Morning Meditation"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="habitDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                placeholder="Describe your habit and why it's important to you"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="habitFrequency">
              <Form.Label>Frequency</Form.Label>
              <Form.Select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="habitAuraPoints">
              <Form.Label>Aura Points</Form.Label>
              <Form.Control
                type="number"
                name="aura_points"
                min="1"
                max="10"
                value={formData.aura_points}
                onChange={handleChange}
                required
              />
              <Form.Text className="text-muted">
                Assign a value from 1 to 10 based on the importance or difficulty of this habit.
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/habits')}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update Habit' : 'Create Habit'}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default HabitForm;
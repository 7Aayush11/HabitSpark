import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HabitCard = ({ habit, onComplete, showActions = true }) => {
  const getFrequencyBadge = (frequency) => {
    switch (frequency.toLowerCase()) {
      case 'daily':
        return <Badge bg="primary">Daily</Badge>;
      case 'weekly':
        return <Badge bg="success">Weekly</Badge>;
      case 'monthly':
        return <Badge bg="info">Monthly</Badge>;
      default:
        return <Badge bg="secondary">{frequency}</Badge>;
    }
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title>{habit.name}</Card.Title>
        <Card.Text>{habit.description}</Card.Text>
        <div className="mb-2">
          {getFrequencyBadge(habit.frequency)}
          <Badge bg="warning" text="dark" className="ms-2">
            {habit.aura_points || 1} Points
          </Badge>
        </div>
        <div className="d-flex justify-content-between">
          <small className="text-muted">
            Created: {new Date(habit.created_at).toLocaleDateString()}
          </small>
          <small className="text-muted">
            Completions: {habit.completions?.length || 0}
          </small>
        </div>
        
        {showActions && (
          <div className="mt-3 d-flex justify-content-between">
            <div>
              <Button 
                as={Link} 
                to={`/habits/${habit.id}/edit`}
                variant="outline-primary" 
                size="sm"
                className="me-2"
              >
                Edit
              </Button>
              <Button 
                as={Link}
                to={`/habits/${habit.id}/details`}
                variant="outline-secondary" 
                size="sm"
              >
                Details
              </Button>
            </div>
            
            {onComplete && (
              <Button 
                variant="success" 
                size="sm"
                onClick={() => onComplete(habit.id)}
              >
                Complete
              </Button>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default HabitCard; 
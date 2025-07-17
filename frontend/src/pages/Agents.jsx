import React, { useEffect, useState } from 'react';
import { api, handleApiError } from '../utils/api';

function Agents({ onSelect }) {
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await api.getAllAgents();
        setAgents(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        handleApiError(err, setError);
        setAgents([]);
      }
    };
    
    fetchAgents();
  }, []);

  return (
    <div>
      <select 
        className="form-control" 
        onChange={e => onSelect(e.target.value)} 
        defaultValue=""
        style={{
          fontSize: '0.8rem',
          padding: '0.3rem 0.5rem',
          borderRadius: '4px',
          border: '1px solid #ced4da'
        }}
      >
        <option value="">Select Agent</option>
        {agents.map(agent => (
          <option key={agent.id} value={agent.id}>
            {agent.name} ({agent.email})
          </option>
        ))}
      </select>
      {error && (
        <div style={{ 
          fontSize: '0.7rem', 
          color: '#dc3545', 
          marginTop: '0.25rem' 
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default Agents;

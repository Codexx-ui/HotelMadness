import React from 'react';
import { Briefcase, Coins, HeartPulse, Star, Users, AlertTriangle, ShieldAlert, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

export default function Dashboard({ state }) {
  // Helpers for progress colors
  const getStressColor = (val) => {
    if (val < 50) return 'var(--success-color)';
    if (val < 80) return 'var(--warning-color)';
    return 'var(--danger-color)';
  };

  const getReputationColor = (val) => {
    if (val > 70) return 'var(--success-color)';
    if (val > 30) return 'var(--warning-color)';
    return 'var(--danger-color)';
  };

  return (
    <div className="panel dashboard-panel">
      <div className="stat-group">
        <div className="stat-group-title">Player Profile</div>
        <div className="stat-item">
          <span className="stat-label"><Briefcase size={16} color="var(--accent-color)" /> Role</span>
          <span className="stat-value">{state.role || 'Unassigned'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label"><Star size={16} color="var(--warning-color)" /> Shift</span>
          <span className="stat-value">{state.shift || 'None'}</span>
        </div>
      </div>

      <div className="stat-group">
        <div className="stat-group-title">Vital Metrics</div>
        
        <div className="stat-item" style={{ marginBottom: '2px' }}>
          <span className="stat-label"><HeartPulse size={16} color={getStressColor(state.stress)} /> Stress Level</span>
          <span className="stat-value" style={{ color: getStressColor(state.stress) }}>{state.stress}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${state.stress}%`, backgroundColor: getStressColor(state.stress) }}></div>
        </div>

        <div className="stat-item" style={{ marginBottom: '2px', marginTop: '1rem' }}>
          <span className="stat-label"><ShieldAlert size={16} color={getReputationColor(state.reputation)} /> Reputation</span>
          <span className="stat-value" style={{ color: getReputationColor(state.reputation) }}>{state.reputation}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${state.reputation}%`, backgroundColor: getReputationColor(state.reputation) }}></div>
        </div>

        <div className="stat-item" style={{ marginTop: '1rem' }}>
          <span className="stat-label"><Coins size={16} color="var(--success-color)" /> Cash</span>
          <span className="stat-value text-success">€{state.cash}</span>
        </div>
      </div>

      <div className="stat-group">
        <div className="stat-group-title">Corporate Relations</div>
        <div className="stat-item">
          <span className="stat-label"><Users size={16} color="var(--text-secondary)" /> Staff Relations</span>
          <span className="stat-value" style={{ color: state.staffRelations < 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
            {state.staffRelations}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label"><AlertTriangle size={16} color="var(--warning-color)" /> GM Warnings</span>
          <span className="stat-value text-danger">{state.alcoholWarnings} / 3</span>
        </div>
      </div>

      <div className="stat-group">
        <div className="stat-group-title">Hotel KPI</div>
        <div className="stat-item">
          <span className="stat-label"><BarChart3 size={16} /> Occupancy</span>
          <span className="stat-value">{state.occupancy}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label"><TrendingUp size={16} /> Fin. Metric</span>
          <span className="stat-value">{state.financialMetric}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label"><TrendingDown size={16} /> Turnover</span>
          <span className="stat-value">{state.staffTurnover}%</span>
        </div>
      </div>

      <div className="stat-group" style={{ marginBottom: 0 }}>
        <div className="stat-group-title">Inventory / Perks</div>
        <div className="inventory-list">
          {state.inventory.length === 0 ? (
             <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Empty Pockets</span>
          ) : (
            state.inventory.map((item, idx) => (
              <span key={idx} className="inventory-item">{item}</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

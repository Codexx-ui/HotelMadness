import React from 'react';
import { Briefcase, Coins, HeartPulse, Star, Users, AlertTriangle, ShieldAlert, BarChart3, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function Dashboard({ state, nickname }) {
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="panel dashboard-panel">
      <div className="stat-group">
        <div className="stat-group-title">Προφίλ Παίκτη</div>
        {nickname && (
          <div className="stat-item">
            <span className="stat-label">👤 Ψευδώνυμο</span>
            <span className="stat-value" style={{ color: 'var(--accent-color)' }}>{nickname}</span>
          </div>
        )}
        <div className="stat-item">
          <span className="stat-label"><Calendar size={16} color="var(--accent-color)" /> Ημερομηνία</span>
          <span className="stat-value" style={{ fontWeight: 600, color: '#fff' }}>{formatDate(state.currentDate)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label"><Briefcase size={16} color="var(--accent-color)" /> Ρόλος</span>
          <span className="stat-value">{state.role || '—'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label"><Star size={16} color="var(--warning-color)" /> Βάρδια</span>
          <span className="stat-value">{state.turnCount === 0 ? 'Διαδικασία Συνέντευξης' : (state.shift || 'Καμία')}</span>
        </div>
      </div>

      <div className="stat-group">
        <div className="stat-group-title">Ζωτικές Ενδείξεις</div>
        
        <div className="stat-item" style={{ marginBottom: '2px' }}>
          <span className="stat-label"><HeartPulse size={16} color={getStressColor(state.stress)} /> Επίπεδο Άγχους</span>
          <span className="stat-value" style={{ color: getStressColor(state.stress) }}>{state.stress}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${state.stress}%`, backgroundColor: getStressColor(state.stress) }}></div>
        </div>

        <div className="stat-item" style={{ marginBottom: '2px', marginTop: '1rem' }}>
          <span className="stat-label"><ShieldAlert size={16} color={getReputationColor(state.reputation)} /> Φήμη</span>
          <span className="stat-value" style={{ color: getReputationColor(state.reputation) }}>{state.reputation}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${state.reputation}%`, backgroundColor: getReputationColor(state.reputation) }}></div>
        </div>

        <div className="stat-item" style={{ marginTop: '1rem' }}>
          <span className="stat-label"><Coins size={16} color="var(--success-color)" /> Μετρητά</span>
          <span className="stat-value text-success">€{state.cash}</span>
        </div>
      </div>

      <div className="stat-group">
        <div className="stat-group-title">Εταιρικές Σχέσεις</div>
        <div className="stat-item">
          <span className="stat-label"><Users size={16} color="var(--text-secondary)" /> Σχέσεις Προσωπικού</span>
          <span className="stat-value" style={{ color: state.staffRelations < 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
            {state.staffRelations}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label"><AlertTriangle size={16} color="var(--warning-color)" /> Προειδοποιήσεις GM</span>
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
        <div className="stat-group-title">Αντικείμενα / Ικανότητες</div>
        <div className="inventory-list">
          {state.inventory.length === 0 ? (
             <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Άδειες Τσέπες</span>
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

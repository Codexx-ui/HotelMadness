import React, { useState } from 'react';
import { Briefcase, Coins, HeartPulse, Star, Users, AlertTriangle, ShieldAlert, BarChart3, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function Dashboard({ state, nickname }) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

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
    <div className={`panel dashboard-panel ${isMobileExpanded ? 'mobile-expanded' : ''}`}>
      {/* Mobile Toggle Bar */}
      <div 
        className="mobile-dashboard-toggle" 
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
          <span>📊 Στατιστικά:</span>
          <span>😰 <span style={{ color: getStressColor(state.stress) }}>{state.stress}%</span></span>
          <span>⭐ <span style={{ color: getReputationColor(state.reputation) }}>{state.reputation}%</span></span>
          <span>💶 <span style={{ color: 'var(--success-color)' }}>€{state.cash}</span></span>
        </div>
        <span style={{ 
          fontSize: '0.8rem', 
          color: 'var(--accent-color)', 
          transition: 'transform 0.3s', 
          transform: isMobileExpanded ? 'rotate(180deg)' : 'rotate(0deg)' 
        }}>
          ▼
        </span>
      </div>

      <div className="dashboard-content-wrapper">
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
          <div className="stat-item" style={{ marginTop: '0.5rem' }}>
            <span className="stat-label">🔥 Δυσκολία</span>
            <span className="stat-value" style={{ 
              fontSize: '0.8rem', 
              color: 'var(--accent-color)', 
              textTransform: 'uppercase', 
              fontWeight: 600, 
              letterSpacing: '0.05em',
              padding: '2px 8px',
              backgroundColor: 'rgba(102, 252, 241, 0.1)',
              borderRadius: '4px'
            }}>
              {localStorage.getItem('game_difficulty') === 'easy' ? 'HR Lover 💖' :
               localStorage.getItem('game_difficulty') === 'hard' ? 'August Peak 🏖️' :
               localStorage.getItem('game_difficulty') === 'nightmare' ? 'Mustakas Mood 💀' :
               'Normal Shift ⚙️'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">
              <Star size={16} color="var(--warning-color)" /> {state.turnCount === 0 ? 'Φάση' : 'Βάρδια'}
            </span>
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
            <span className="stat-label"><Coins size={16} color="var(--success-color)" /> Λογαριασμός Eurobank</span>
            <span className="stat-value text-success">€{state.cash}</span>
          </div>
          <div className="stat-item" style={{ paddingLeft: '1.5rem', marginTop: '2px', fontSize: '0.85rem' }}>
            <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>└ Φιλοδωρήματα (Tips)</span>
            <span className="stat-value" style={{ color: 'var(--success-color)' }}>€{state.tips || 0}</span>
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
    </div>
  );
}

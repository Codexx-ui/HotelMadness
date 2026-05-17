import React from 'react';
import { MessageSquare, Star } from 'lucide-react';

export default function EventTerminal({ sceneData, onChoice, isLoading, onThesfapaClick }) {
  if (!sceneData) {
    return (
      <div className="panel terminal-panel" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Awaiting systemic initialization...</p>
      </div>
    );
  }

  const {
    scene_title,
    story_text,
    active_vip_archetype,
    recent_tripadvisor_review,
    choices
  } = sceneData;

  return (
    <div className="panel terminal-panel" style={{ position: 'relative' }}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div>
        <div className="terminal-header">
          <h2 className="scene-title">{scene_title}</h2>
          {active_vip_archetype && active_vip_archetype !== 'None' && (
            <span className="badge vip">{active_vip_archetype}</span>
          )}
        </div>

        <div className="story-content">
          <p>
            {(() => {
              if (!story_text) return null;
              const urlRegex = /(https?:\/\/[^\s]+)/g;
              const parts = story_text.split(urlRegex);
              return parts.map((part, index) => {
                if (part.match(urlRegex)) {
                  const isThesfapa = part.includes('Thesfapa');
                  return (
                    <a
                      key={index}
                      href={part}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (isThesfapa && onThesfapaClick) {
                          onThesfapaClick();
                        }
                      }}
                      style={{
                        color: 'var(--accent-color)',
                        textDecoration: 'underline',
                        fontWeight: 600,
                        wordBreak: 'break-all',
                        cursor: 'pointer'
                      }}
                    >
                      {isThesfapa ? 'Θες Φαπα ✨ παίξε τώρα!' : part}
                    </a>
                  );
                }
                return part;
              });
            })()}
          </p>
          
          {recent_tripadvisor_review && recent_tripadvisor_review.text && (
            <div className="review-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <MessageSquare size={16} color="var(--warning-color)" />
                <span style={{ fontWeight: 600 }}>TripAdvisor Review alert</span>
              </div>
              <div className="review-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < recent_tripadvisor_review.stars ? "currentColor" : "none"} />
                ))}
              </div>
              <div className="review-text">"{recent_tripadvisor_review.text}"</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                - {recent_tripadvisor_review.author || 'Anonymous Guest'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="choices-container">
        {choices && choices.map((choice) => (
          <button 
            key={choice.id} 
            className="choice-btn"
            onClick={() => onChoice(choice)}
            disabled={isLoading}
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function CustomGauge({ value, max, label }) {
  const percentage = (value / max) * 100; // Normaliza el valor al porcentaje

  return (
    <div style={{ width: '200px', height: '200px' }}>
      <CircularProgressbar
        value={percentage}
        text={`${label === 'V' ? value.toFixed(2) : Math.round(value)} ${label}`}
        styles={buildStyles({
          textColor: '#000', // Color del texto
          pathColor: '#00FF00', // Color del indicador
          trailColor: '#ddd', // Color del fondo
          textSize: '16px', // Tamaño del texto
        })}
      />
    </div>
  );
}

export default CustomGauge;



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import './App.css';
import logo from './assets/Logo-EPN.png'; // Importa el logotipo
import GaugeChart from 'react-gauge-chart'; // Importar la biblioteca de gauges
import CustomGauge from './CustomGauge'; // Importa el nuevo componente

function App() {
  const [sliderValue, setSliderValue] = useState(50);
  const [values, setValues] = useState({
    Kp: 0.0,
    Ki: 0.0,
    Kd: 0.0,
    Kn: 0.0,
    Ks: 0.0,
  });
  const [dataVelocidad, setDataVelocidad] = useState({ labels: [], datasets: [] });
  const [dataSenalControl, setDataSenalControl] = useState({ labels: [], datasets: [] });
  const [velocidadActual, setVelocidadActual] = useState(0); // Estado para Velocidad
  const [senalControlActual, setSenalControlActual] = useState(0); // Estado para Señal de Control


  // Enviar el valor del slider cuando cambie
  const handleSliderChange = (e) => {
    const newValue = e.target.value;
    setSliderValue(newValue);

    // Enviar el valor del slider al servidor inmediatamente
    console.log('Enviando valor del slider:', newValue);
    axios.post('http://192.168.1.15:5003/actualizar-slider', { sliderValue: newValue })
      .then(response => {
        console.log('Valor del slider enviado:', response.data);
      })
      .catch(error => {
        console.error('Error al enviar el valor del slider:', error);
      });
  };

  // Obtener datos desde el servidor cada segundo
  useEffect(() => {
    const fetchData = () => {
      axios.get('http://192.168.1.15:5003/datos') // Asegúrate de que esta URL sea la correcta
        .then(response => {
          // Verificar si los datos están vacíos
          if (response.data.length === 0) {
            console.warn('No se recibieron datos del servidor.');
            return;
          }
  
          console.log('Datos recibidos del servidor:', response.data); // Log para depuración
  
          // Actualizar los estados para Velocidad y Señal de Control
          const lastEntry = response.data[0]; // Obtén el último registro
          setVelocidadActual(lastEntry.Velocidad); // Actualiza velocidad
          setSenalControlActual(lastEntry.Senal_control); // Actualiza señal de control
  
          // Procesar los datos recibidos para las gráficas
          const data = response.data.slice(-100).reverse(); // Mostrar los últimos 100 datos sin invertir
          const tiempos = data.map(item => {
            const date = new Date(item.Tiempo);
            const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            return localDate.toLocaleTimeString();
          });
          const velocidades = data.map(item => item.Velocidad);
          const referencias = data.map(item => item.Referencia);
          const senalControl = data.map(item => item.Senal_control);
  
          // Actualizar las gráficas
          setDataVelocidad({
            labels: tiempos,
            datasets: [
              {
                label: 'Velocidad',
                data: velocidades,
                fill: false,
                borderColor: 'rgb(18, 89, 170)',
                tension: 0.1,
                pointRadius: 0,
              },
              {
                label: 'Referencia',
                data: referencias,
                fill: false,
                borderColor: 'rgba(192,75,75,1)',
                tension: 0.1,
                pointRadius: 0,
              },
            ],
          });
  
          setDataSenalControl({
            labels: tiempos,
            datasets: [
              {
                label: 'Señal de Control',
                data: senalControl,
                fill: false,
                borderColor: 'rgb(36, 57, 177)',
                tension: 0.1,
                pointRadius: 0,
              },
            ],
          });
  
          // Actualizar las constantes Kp, Ki, Kd, Kn, Ks
          setValues({
            Kp: lastEntry.Kp,
            Ki: lastEntry.Ki,
            Kd: lastEntry.Kd,
            Kn: lastEntry.Kn,
            Ks: lastEntry.Ks,
          });
        })
        .catch(error => console.error('Error al obtener los datos:', error));
    };
  
    const intervalId = setInterval(fetchData, 1000); // Actualiza cada segundo
    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: parseFloat(value),
    });
  };

  const optionsVelocidad = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tiempo [seg]',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Velocidad [RPM]',
        },
        min: 0,
        max: 5000,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  const optionsSenalControl = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tiempo [seg]',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Voltaje [V]',
        },
        min: 0,
        max: 6,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  return (
    <div className="App">
      <header className="header">
        <img src={logo} alt="Logo EPN" className="logo" />
        <div className="header-titles">
          <h1>ESCUELA POLITÉCNICA NACIONAL</h1>
          <h2>INTERFAZ REMOTA DE CONTROL DE VELOCIDAD DE UN MOTOR DC</h2>
        </div>
      </header>

      <div className="container">
        <div className="slider-container">
          <h2>Referencia</h2>
          <div className="slider-wrapper">
            <div className="slider-scale">
              <span>5000</span>
              <span>4500</span>
              <span>4000</span>
              <span>3500</span>
              <span>3000</span>
              <span>2500</span>
              <span>2000</span>
              <span>1500</span>
              <span>1000</span>
              <span>500</span>
              <span>0</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              value={sliderValue}
              onChange={handleSliderChange}
              className="vertical-slider"
            />
          </div>
          <p className="slider-value">Velocidad de Referencia: {sliderValue}</p>
        </div>

        <div className="controls-container">
          <h2>Constantes</h2>
          <div className="controls">
            <h3>Constantes Controlador PID</h3>
            <label>
              Kp:  
              <input
                type="number"
                step="0.001"
                name="Kp"
                value={values.Kp}
                onChange={handleInputChange}
              />
            </label>
            <br />
            <label>
              Ki:  
              <input
                type="number"
                step="0.001"
                name="Ki"
                value={values.Ki}
                onChange={handleInputChange}
              />
            </label>
            <br />
            <label>
              Kd:  
              <input
                type="number"
                step="0.001"
                name="Kd"
                value={values.Kd}
                onChange={handleInputChange}
              />
            </label>

            <h3>Constantes Controlador PID No Lineal</h3>
            <label>
              Kn:  
              <input
                type="number"
                step="0.001"
                name="Kn"
                value={values.Kn}
                onChange={handleInputChange}
              />
            </label>
            <br />
            <label>
              Ks:  
              <input
                type="number"
                step="0.001"
                name="Ks"
                value={values.Ks}
                onChange={handleInputChange}
              />
            </label>
          </div>
        </div>



        <div className="chart-gauge-pair">
          <div className="chart">
            <h2>Velocidad del Motor</h2>
            <Line data={dataVelocidad} options={optionsVelocidad}  />
          </div>
          <div className="chart">
            <h2>Voltaje del Motor</h2>
            <Line data={dataSenalControl} options={optionsSenalControl} />
          </div>
          
        </div>


        <div className="chart-gauge-pair">
          <div className="gauge">
            <h2>Velocidad Actual</h2>
            <CustomGauge value={velocidadActual} max={5000} label="RPM" />
          </div>
          <div className="gauge">
            <h2>Voltaje Actual</h2>
            <CustomGauge value={senalControlActual} max={6} label="V" />
          </div>

        </div>

        
      </div>
    </div>
  );
}

export default App;

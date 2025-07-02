function calcular() {
  const resultado = document.getElementById('resultado');
  const longitud_onda = document.getElementById('longitud_onda');
  const info = document.getElementById("infoAdicional");

  let D_raw = document.getElementById('distancia').value.trim().replace(',', '.');
  let f_raw = document.getElementById('frecuencia').value.trim().replace(',', '.');

  const D = parseFloat(D_raw);
  const f = parseFloat(f_raw);

  if (isNaN(D) || isNaN(f) || D <= 0 || f <= 0) {
    alert('Por favor ingrese valores válidos y mayores a cero.');
    return;
  }

  const F1 = Math.floor(8.656 * Math.sqrt(D / f) * 100) / 100;
  resultado.textContent = `Zona de Fresnel (F₁): ${F1.toFixed(2)} metros`;

  const c = 3e8;
  const lambda = c / (f * 1e9);
  longitud_onda.textContent = `Longitud de onda: ${lambda.toFixed(2)} m`;

  let mensajeExtra = "";
  if (F1 < 5) {
    mensajeExtra = "⚠️ Zona de Fresnel pequeña: susceptible a interferencias si hay obstáculos. Se recomienda despejar la línea de visión.";
  } else if (F1 >= 5 && F1 <= 15) {
    mensajeExtra = "✅ Zona de Fresnel adecuada: buena propagación si se mantiene libre de obstrucciones.";
  } else {
    mensajeExtra = "ℹ️ Zona de Fresnel grande: ideal para enlaces de larga distancia. Asegurarse de que no existan objetos dentro de esta zona.";
  }
  info.textContent = mensajeExtra;

  const x = [], y = [];
  for (let i = 0; i <= 100; i++) {
    const xi = (D * i) / 100;
    const yi = F1 * Math.sqrt(1 - Math.pow((2 * i / 100 - 1), 2));
    x.push(xi.toFixed(2));
    y.push(yi);
  }

  const graficoCanvas = document.getElementById("graficoFresnel");
  const existingChart = Chart.getChart(graficoCanvas);
  if (existingChart) existingChart.destroy();

  new Chart(graficoCanvas, {
    type: "line",
    data: {
      labels: x,
      datasets: [{
        label: "Curva de Fresnel (visual)",
        data: y,
        borderColor: "lime",
        backgroundColor: "rgba(0,255,0,0.2)",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Distancia (km)" } },
        y: { title: { display: true, text: "Altura (m)" } }
      }
    }
  });
}

function limpiar() {
  document.getElementById('distancia').value = '';
  document.getElementById('frecuencia').value = '';
  document.getElementById('resultado').textContent = '';
  document.getElementById('longitud_onda').textContent = '';
  document.getElementById('infoAdicional').textContent = '';

  const graficoCanvas = document.getElementById("graficoFresnel");
  const existingChart = Chart.getChart(graficoCanvas);
  if (existingChart) existingChart.destroy();
}

// Sliders sincronizados
const sliderD = document.getElementById("sliderDistancia");
const sliderF = document.getElementById("sliderFrecuencia");
const inputD = document.getElementById("distancia");
const inputF = document.getElementById("frecuencia");
const labelD = document.getElementById("labelDistancia");
const labelF = document.getElementById("labelFrecuencia");

sliderD.addEventListener("input", () => {
  inputD.value = sliderD.value;
  labelD.textContent = sliderD.value;
  calcular();
});

sliderF.addEventListener("input", () => {
  inputF.value = sliderF.value;
  labelF.textContent = sliderF.value;
  calcular();
});

inputD.addEventListener("input", () => {
  let val = parseFloat(inputD.value.replace(",", "."));
  if (!isNaN(val)) {
    sliderD.value = val;
    labelD.textContent = val;
  }
});

inputF.addEventListener("input", () => {
  let val = parseFloat(inputF.value.replace(",", "."));
  if (!isNaN(val)) {
    sliderF.value = val;
    labelF.textContent = val;
  }
});



// Modo claro/oscuro
document.getElementById("toggleTema").addEventListener("change", function () {
  const body = document.body;
  const etiqueta = document.getElementById("etiquetaTema");
  if (this.checked) {
    body.classList.add("claro");
    etiqueta.textContent = "Modo oscuro";
  } else {
    body.classList.remove("claro");
    etiqueta.textContent = "Modo claro";
  }
});

// Obstrucción visual entre antenas
const sliderObs = document.getElementById("obstaculoSlider");
const canvasObs = document.getElementById("graficoObstruccion");
const ctxObs = canvasObs.getContext("2d");
const infoObs = document.getElementById("infoObstruccion");

sliderObs.addEventListener("input", () => {
  dibujarEscena();
});

function dibujarEscena() {
  const pos = parseInt(sliderObs.value);
  const ancho = canvasObs.width;
  const alto = canvasObs.height;

  ctxObs.clearRect(0, 0, ancho, alto);

  // Antenas
  ctxObs.fillStyle = "green";
  ctxObs.fillRect(10, alto / 2 - 40, 10, 80);
  ctxObs.fillRect(ancho - 20, alto / 2 - 40, 10, 80);

  // Línea Fresnel (curva)
  ctxObs.strokeStyle = "lime";
  ctxObs.lineWidth = 2;
  ctxObs.beginPath();
  for (let i = 0; i <= 100; i++) {
    const x = (ancho - 40) * (i / 100) + 20;
    const y = alto / 2 - 60 * Math.sqrt(1 - Math.pow((2 * i / 100 - 1), 2));
    if (i === 0) ctxObs.moveTo(x, y);
    else ctxObs.lineTo(x, y);
  }
  ctxObs.stroke();

  // Obstáculo
  const xObs = (ancho - 40) * (pos / 100) + 20;
  const yObs = alto / 2 - 60;
  ctxObs.fillStyle = "red";
  ctxObs.fillRect(xObs - 10, yObs - 20, 20, 40);

  // Evaluación obstrucción
  if (pos >= 40 && pos <= 60) {
    infoObs.textContent = "⚠️ Obstáculo dentro del primer Fresnel: posible interferencia significativa.";
    infoObs.style.color = "red";
  } else {
    infoObs.textContent = "✅ Obstáculo fuera de la zona crítica de Fresnel.";
    infoObs.style.color = "lime";
  }
}

// Dibujo inicial
dibujarEscena();


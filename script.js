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

// Modo claro/oscuro y sliders sincronizados (igual que ya tenías)

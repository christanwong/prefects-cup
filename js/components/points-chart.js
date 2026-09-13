import { HOUSES } from "../config.js";

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function themeColors() {
  return darkQuery.matches
    ? { text: "#dbdbdb", grid: "rgba(255, 255, 255, 0.12)" }
    : { text: "#4a4a4a", grid: "rgba(0, 0, 0, 0.08)" };
}

export function createPointsChart(canvas) {
  let lastTotals = null;

  const chart = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: { labels: [], datasets: [{ label: "Points", data: [], borderWidth: 1, borderRadius: 3 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: {} },
        y: { beginAtZero: true, grid: {}, ticks: { precision: 0 } },
      },
    },
  });

  function draw(totals) {
    const { text, grid } = themeColors();

    const rows = HOUSES
      .map((house) => ({ label: house.label, value: Number(totals[house.key]) || 0, color: house.color }))
      .sort((a, b) => b.value - a.value);

    chart.data.labels = rows.map((row) => row.label);
    chart.data.datasets[0].data = rows.map((row) => row.value);
    chart.data.datasets[0].backgroundColor = rows.map((row) => row.color);
    chart.data.datasets[0].borderColor = rows.map((row) => row.color.replace("0.6", "1"));

    chart.options.scales.x.ticks.color = text;
    chart.options.scales.y.ticks.color = text;
    chart.options.scales.y.grid.color = grid;

    chart.update();
  }

  darkQuery.addEventListener("change", () => {
    if (lastTotals) draw(lastTotals);
  });

  return {
    update(totals) {
      lastTotals = totals;
      draw(totals);
    },
  };
}

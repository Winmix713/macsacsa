const TEAMS = {
  Spanish: [
    "Alaves",
    "Barcelona",
    "Bilbao",
    "Getafe",
    "Girona",
    "Las Palmas",
    "Madrid Fehér",
    "Madrid Piros",
    "Mallorca",
    "Osasuna",
    "San Sebastian",
    "Sevilla Piros",
    "Sevilla Zöld",
    "Valencia",
    "Villarreal",
    "Vigo"
  ],
  English: [
    "London Blue",
    "London Gold",
    "Manchester Red",
    "Manchester Sky",
    "Merseyside Red",
    "Merseyside Blue",
    "North London White",
    "North London Scarlet",
    "Newcastle Night",
    "Birmingham Steam",
    "Nottingham Forest",
    "Leeds Wave",
    "South Coast Amber",
    "South Coast Navy",
    "Leicester Royal",
    "Sheffield Steel"
  ]
};

const leagueSelect = document.getElementById("leagueSelect");
const homeTeamSelect = document.getElementById("homeTeamSelect");
const awayTeamSelect = document.getElementById("awayTeamSelect");
const predictButton = document.getElementById("predictButton");
const statusMessage = document.getElementById("statusMessage");
const resultSection = document.getElementById("resultSection");
const tipValue = document.getElementById("tipValue");
const confidenceBadge = document.getElementById("confidenceBadge");
const confidenceValue = document.getElementById("confidenceValue");
const probabilityChart = document.getElementById("probabilityChart");
const rationaleList = document.getElementById("rationaleList");
const modelVersion = document.getElementById("modelVersion");
const metricsSection = document.getElementById("metricsSection");
const metricsContent = document.getElementById("metricsContent");

const CONFIDENCE_THRESHOLDS = {
  high: 70,
  medium: 40
};

function init() {
  populateLeagues();
  populateTeams(leagueSelect.value);
  attachListeners();
  registerServiceWorker();
  loadMetrics();
}

document.addEventListener("DOMContentLoaded", init);

function populateLeagues() {
  Object.keys(TEAMS).forEach((leagueKey) => {
    const option = document.createElement("option");
    option.value = leagueKey;
    option.textContent = leagueKey === "Spanish" ? "Spanyol" : "Angol";
    leagueSelect.append(option);
  });
  leagueSelect.value = "Spanish";
}

function populateTeams(league) {
  const teams = TEAMS[league];
  updateSelectOptions(homeTeamSelect, teams);
  updateSelectOptions(awayTeamSelect, teams);

  if (homeTeamSelect.value === awayTeamSelect.value) {
    const alternative = teams.find((team) => team !== homeTeamSelect.value);
    if (alternative) {
      awayTeamSelect.value = alternative;
    }
  }
}

function updateSelectOptions(selectNode, teams) {
  selectNode.innerHTML = "";
  teams.forEach((team) => {
    const option = document.createElement("option");
    option.value = team;
    option.textContent = team;
    selectNode.append(option);
  });
}

function attachListeners() {
  leagueSelect.addEventListener("change", () => {
    populateTeams(leagueSelect.value);
    clearResult();
    setStatus("A liga módosult. Válassz csapatokat és futtasd újra a predikciót.", "info");
  });

  homeTeamSelect.addEventListener("change", () => enforceDifferentTeams(homeTeamSelect, awayTeamSelect));
  awayTeamSelect.addEventListener("change", () => enforceDifferentTeams(awayTeamSelect, homeTeamSelect));

  document.getElementById("predictionForm").addEventListener("submit", onSubmit);
}

function enforceDifferentTeams(changedSelect, otherSelect) {
  if (changedSelect.value === otherSelect.value) {
    const teams = TEAMS[leagueSelect.value];
    const alternative = teams.find((team) => team !== changedSelect.value);
    if (alternative) {
      otherSelect.value = alternative;
    }
  }
}

async function onSubmit(event) {
  event.preventDefault();

  const league = leagueSelect.value;
  const homeTeam = homeTeamSelect.value;
  const awayTeam = awayTeamSelect.value;

  if (!league || !homeTeam || !awayTeam) {
    setStatus("Kérjük, töltsd ki az összes mezőt.", "error");
    return;
  }

  if (homeTeam === awayTeam) {
    setStatus("A hazai és vendég csapat nem lehet ugyanaz.", "error");
    return;
  }

  await requestPrediction({ league, home_team: homeTeam, away_team: awayTeam });
}

async function requestPrediction(payload) {
  clearResult();
  setLoading(true, "Predikció folyamatban…");

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorDetail = await extractError(response);
      const errorMessage = getFriendlyErrorMessage(response.status, errorDetail, payload.league);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    renderResult(data);
    setStatus("Predikció sikeresen lefutott.", "success");
  } catch (error) {
    const fallbackMessage = "Az API nem elérhető. Ellenőrizd az internetkapcsolatot vagy a szerver állapotát.";
    const message = (error && error.message) ? error.message : "Váratlan hiba történt.";
    if (message === "Failed to fetch" || message === "NetworkError when attempting to fetch resource.") {
      setStatus(fallbackMessage, "error");
    } else {
      setStatus(message, "error");
    }
  } finally {
    setLoading(false);
  }
}

async function extractError(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const payload = await response.json();
      return payload.detail || payload.message || JSON.stringify(payload);
    } catch (error) {
      return response.statusText;
    }
  }
  return response.statusText;
}

function getFriendlyErrorMessage(status, detail, league) {
  if (status === 0) {
    return "Az API nem elérhető. Ellenőrizd az internetkapcsolatot vagy a szerver állapotát.";
  }

  if (status === 422) {
    if (league !== "Spanish") {
      return "Jelenleg csak a spanyol liga támogatott a backendben.";
    }
    return detail || "Validációs hiba: ellenőrizd a mezőket.";
  }

  if (status === 404) {
    return detail || "Nem található adat ehhez a csapatpároshoz.";
  }

  return detail || "Ismeretlen hiba történt a predikció során.";
}

function renderResult(result) {
  const confidencePercent = Math.round((result.confidence ?? 0) * 100);
  const tip = result.tip ?? "?";

  tipValue.textContent = tip;
  updateConfidenceBadge(confidencePercent);
  renderProbabilities(result.probs || {});
  renderRationale(result.rationale || {});

  if (result.version) {
    modelVersion.textContent = `Modell verzió: ${result.version}`;
    modelVersion.classList.remove("is-hidden");
  } else {
    modelVersion.textContent = "";
    modelVersion.classList.add("is-hidden");
  }

  resultSection.classList.remove("is-hidden");
}

function updateConfidenceBadge(confidencePercent) {
  confidenceBadge.textContent = `${confidencePercent}%`;
  confidenceValue.textContent = confidencePercent === 0
    ? "Nincs biztonsági adat"
    : `Biztonság: ${confidencePercent}%`;

  confidenceBadge.classList.remove(
    "confidence__badge--high",
    "confidence__badge--medium",
    "confidence__badge--low"
  );

  if (confidencePercent >= CONFIDENCE_THRESHOLDS.high) {
    confidenceBadge.classList.add("confidence__badge--high");
  } else if (confidencePercent >= CONFIDENCE_THRESHOLDS.medium) {
    confidenceBadge.classList.add("confidence__badge--medium");
  } else {
    confidenceBadge.classList.add("confidence__badge--low");
  }
}

function renderProbabilities(probs) {
  probabilityChart.innerHTML = "";

  ["H", "D", "A"].forEach((label) => {
    const value = Number(probs[label] ?? 0);
    const percent = Math.round(value * 1000) / 10;

    const row = document.createElement("div");
    row.className = "prob-chart__row";

    const labelEl = document.createElement("div");
    labelEl.className = "prob-chart__label";
    labelEl.textContent = label;

    const barWrapper = document.createElement("div");
    barWrapper.className = "prob-chart__bar-wrapper";

    const bar = document.createElement("div");
    bar.className = "prob-chart__bar";
    bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;

    const valueEl = document.createElement("div");
    valueEl.className = "prob-chart__value";
    valueEl.textContent = `${percent.toFixed(1)}%`;

    barWrapper.append(bar);
    row.append(labelEl, barWrapper, valueEl);
    probabilityChart.append(row);
  });
}

function renderRationale(rationale) {
  rationaleList.innerHTML = "";

  const entries = [
    { label: "Pár", value: rationale.directed_pair },
    { label: "Hist. minták", value: rationale.hist_n },
    { label: "Aktuális minták", value: rationale.curr_n },
    { label: "Hist. súly", value: rationale.weights?.hist },
    { label: "Aktuális súly", value: rationale.weights?.curr }
  ];

  entries
    .filter((entry) => entry.value !== undefined && entry.value !== null)
    .forEach((entry) => {
      const dt = document.createElement("dt");
      dt.textContent = entry.label;

      const dd = document.createElement("dd");
      dd.textContent = String(entry.value);

      rationaleList.append(dt, dd);
    });

  if (!rationaleList.children.length) {
    const dt = document.createElement("dt");
    dt.textContent = "Részletek";
    const dd = document.createElement("dd");
    dd.textContent = "Nem érkezett magyarázó adat.";
    rationaleList.append(dt, dd);
  }
}

function loadMetrics() {
  const candidates = [
    "./metrics.json",
    "../test_reports/metrics.json",
    "/test_reports/metrics.json"
  ];

  (async function tryFetch(paths) {
    if (!paths.length) {
      return;
    }

    const [current, ...rest] = paths;

    try {
      const response = await fetch(current);
      if (!response.ok) {
        throw new Error("not ok");
      }
      const data = await response.json();
      renderMetrics(data);
      return;
    } catch (error) {
      return tryFetch(rest);
    }
  })(candidates);
}

function renderMetrics(metrics) {
  metricsSection.classList.remove("is-hidden");

  const accuracyPercent = Math.round((metrics.accuracy ?? 0) * 1000) / 10;
  const headline = document.createElement("div");
  headline.className = "metrics__headline";
  headline.innerHTML = `<strong>${accuracyPercent.toFixed(1)}%</strong><span>összpontosság</span>`;

  const totals = document.createElement("div");
  totals.className = "metrics__grid";

  const totalItem = document.createElement("div");
  totalItem.className = "metrics__item";
  totalItem.innerHTML = `<h4>Összes predikció</h4><span>${metrics.total_predictions}</span>`;

  const correctItem = document.createElement("div");
  correctItem.className = "metrics__item";
  correctItem.innerHTML = `<h4>Helyes tippek</h4><span>${metrics.correct_predictions}</span>`;

  totals.append(totalItem, correctItem);

  const perClass = document.createElement("div");
  perClass.className = "metrics__grid";

  Object.entries(metrics.per_class || {}).forEach(([key, values]) => {
    const item = document.createElement("div");
    item.className = "metrics__item";
    const precision = formatPercent(values.precision);
    const recall = formatPercent(values.recall);
    const f1 = formatPercent(values.f1);

    item.innerHTML = `
      <h4>${translateOutcome(key)}</h4>
      <span>Precision: ${precision}</span><br />
      <span>Recall: ${recall}</span><br />
      <span>F1: ${f1}</span><br />
      <span>Minta: ${values.support}</span>
    `;

    perClass.append(item);
  });

  metricsContent.innerHTML = "";
  metricsContent.append(headline, totals, perClass);
}

function translateOutcome(label) {
  switch (label) {
    case "H":
      return "Hazai (H)";
    case "D":
      return "Döntetlen (D)";
    case "A":
      return "Vendég (A)";
    default:
      return label;
  }
}

function formatPercent(value) {
  const percent = Math.round(Number(value || 0) * 1000) / 10;
  return `${percent.toFixed(1)}%`;
}

function setStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = "status";
  if (message) {
    statusMessage.classList.add(`status--${type}`);
  }
}

function setLoading(isLoading, message) {
  predictButton.disabled = isLoading;
  predictButton.textContent = isLoading ? "Betöltés…" : "Predict";
  if (isLoading) {
    setStatus(message || "Betöltés…", "info");
  }
}

function clearResult() {
  resultSection.classList.add("is-hidden");
  tipValue.textContent = "—";
  confidenceBadge.textContent = "—";
  confidenceBadge.classList.remove(
    "confidence__badge--high",
    "confidence__badge--medium",
    "confidence__badge--low"
  );
  confidenceValue.textContent = "";
  probabilityChart.innerHTML = "";
  rationaleList.innerHTML = "";
  modelVersion.textContent = "";
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .catch(() => {
          /* silent */
        });
    });
  }
}

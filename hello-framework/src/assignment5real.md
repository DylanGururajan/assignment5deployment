---
title: Assignment 5 Interactive Chart
---

## Assignment 5 Interactive Visualization

```js
import * as d3 from "npm:d3";
const drugs = await FileAttachment("data/drugs.csv").csv({typed: true});

function drugChart(data, {width} = {}) {
  const rows = data.filter(d =>
    String(d.STUB_LABEL).toLowerCase().trim() === "all persons" &&
    String(d.AGE).toLowerCase().trim() === "all ages"
  );
  const dataset = rows.length ? rows : data.slice();

  const parseYear = d => {
    const y1 = d.YEAR != null ? Number(d.YEAR) : NaN;
    const y2 = d.YEAR_NUM != null ? Number(d.YEAR_NUM) : NaN;
    return Number.isFinite(y1) ? y1 : (Number.isFinite(y2) ? y2 : NaN);
  };

  const grouped = Array.from(d3.group(dataset, d => d.PANEL), ([key, vals]) => {
    const byYear = new Map();
    for (const v of vals) {
      const yr = parseYear(v);
      if (!Number.isFinite(yr)) continue;
      const est = Number(v.ESTIMATE);
      if (!Number.isFinite(est)) continue;
      if (!byYear.has(yr)) byYear.set(yr, []);
      byYear.get(yr).push(est);
    }
    
    const arr = Array.from(byYear, ([yr, arrVals]) => ({ YEAR: yr, ESTIMATE: d3.mean(arrVals) }));
    arr.sort((a,b) => a.YEAR - b.YEAR);
    return { key, values: arr };
  }).filter(g => g.values.length > 0);

  const outerWidth = Math.max(640, Math.min(width || 900, 1100));
  const margin = { top: 44, right: 24, bottom: 56, left: 100 };
  const innerWidth = outerWidth - margin.left - margin.right;
  const outerHeight = 480;
  const innerHeight = outerHeight - margin.top - margin.bottom;

  const allYears = Array.from(new Set(grouped.flatMap(g => g.values.map(v => v.YEAR)))).sort((a,b)=>a-b);
  const xMin = d3.min(allYears);
  const xMax = d3.max(allYears);
  const x = d3.scaleLinear().domain([xMin, xMax]).range([0, innerWidth]).nice();

  const yMax = d3.max(grouped, g => d3.max(g.values, v => v.ESTIMATE)) || 1;
  const y = d3.scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]);

  const keys = grouped.map(g => g.key);
  const color = d3.scaleOrdinal().domain(keys).range(d3.schemeTableau10);

  const root = document.createElement("div");
  root.style.fontFamily = "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
  root.style.maxWidth = `${outerWidth}px`;
  root.style.position = "relative";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "center";
  header.style.alignItems = "center";
  header.style.textAlign = "center";
  header.style.marginBottom = "10px";
  header.innerHTML = `<h2 style="margin:0; font-size: 22px; font-weight:600;">Overdose Death Rate Trends</h2>`;
  root.appendChild(header);

  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${outerWidth} ${outerHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")
    .style("font", "12px sans-serif");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xAxisG = g.append("g").attr("transform", `translate(0,${innerHeight})`);
  const yAxisG = g.append("g");
  const xAxis = d3.axisBottom(x).ticks(Math.min(12, allYears.length)).tickFormat(d3.format("d"));
  const yAxis = d3.axisLeft(y).ticks(6);
  xAxisG.call(xAxis);
  yAxisG.call(yAxis);

  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .style("font-weight", 600)
    .style("font-size", "16px")
    .text("Year");

  g.append("text")
    .attr("transform", `translate(-60,${innerHeight / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .style("font-weight", 600)
    .style("font-size", "16px")
    .text("Death Rate (ESTIMATE)");

  const line = d3.line()
    .x(d => x(d.YEAR))
    .y(d => y(d.ESTIMATE))
    .curve(d3.curveMonotoneX);

  const linesG = g.append("g").attr("class", "lines");
  const series = linesG.selectAll(".series")
    .data(grouped, d => d.key)
    .enter()
    .append("g")
    .attr("class", "series");

  const pathByKey = new Map();

  series.append("path")
    .attr("class", "line")
    .attr("d", d => line(d.values))
    .attr("fill", "none")
    .attr("stroke", d => color(d.key))
    .attr("stroke-width", 2)
    .attr("opacity", 0.95)
    .each(function(d) { pathByKey.set(d.key, d3.select(this)); });

  const tooltip = document.createElement("div");
  Object.assign(tooltip.style, {
    position: "absolute",
    pointerEvents: "none",
    background: "rgba(0,0,0,0.80)",
    color: "white",
    padding: "6px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    display: "none",
    zIndex: 1000,
    maxWidth: "260px",
    whiteSpace: "nowrap"
  });
  root.appendChild(tooltip);

  series.selectAll("circle")
    .data(d => d.values.map(v => ({ series: d.key, d: v })))
    .enter()
    .append("circle")
    .attr("cx", p => x(p.d.YEAR))
    .attr("cy", p => y(p.d.ESTIMATE))
    .attr("r", 4)
    .attr("fill", p => color(p.series))
    .attr("stroke", "white")
    .attr("stroke-width", 0.6)
    .style("cursor", "pointer")
    .on("mouseover", (event, p) => {
      pathByKey.forEach((sel, k) => sel.transition().duration(120).style("opacity", k === p.series ? 1 : 0.12).style("stroke-width", k === p.series ? 3 : 1));
      const rect = root.getBoundingClientRect();
      const left = (event.clientX - rect.left) + 10;
      const top = (event.clientY - rect.top) + 8;
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.style.display = "block";
      tooltip.innerHTML = `<strong>${p.series}</strong><br/>Year: ${p.d.YEAR}<br/>Estimate: ${Number(p.d.ESTIMATE).toFixed(2)}`;
    })
    .on("mousemove", (event, p) => {
      const rect = root.getBoundingClientRect();
      tooltip.style.left = `${(event.clientX - rect.left) + 10}px`;
      tooltip.style.top = `${(event.clientY - rect.top) + 8}px`;
    })
    .on("mouseout", (event, p) => {
      pathByKey.forEach(sel => sel.transition().duration(120).style("opacity", 0.95).style("stroke-width", 2));
      tooltip.style.display = "none";
    });

  root.appendChild(svg.node());
  // footer
  const note = document.createElement("div");
  note.style.marginTop = "8px";
  note.style.fontSize = "12px";
  note.style.color = "#444";
  note.innerHTML = `<em>Estimate death rate from drug overdoses grouped by type of drug. Hover over a line to see what drug it represents. Note values are estimates</em>`;
  root.appendChild(note);

  return root;
}

```
<div class="grid grid-cols-1"> <div class="card"> ${resize((width) => drugChart(drugs, {width}))} </div> </div>
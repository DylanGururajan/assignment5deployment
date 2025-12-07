---
title: Assignment 5
---

## Assignment 5 - Connecticut Drug Related Injury

```js
import * as d3 from "npm:d3";

async function overdoseMap({ width = 960 } = {}) {
  const height = Math.round(width * 0.72);

  function parseGeoField(field) {
    if (!field) return null;
    const m = String(field).match(/\(([-\d.]+),\s*([-\d.]+)\)/);
    if (!m) return null;
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    return null;
  }

  function flagValue(v) {
    if (v == null) return false;
    const s = String(v).trim().toUpperCase();
    return s === "Y" || s === "YES" || s === "TRUE" || s === "1";
  }

  const DRUGS = ["Fentanyl", "Heroin", "Cocaine"];

  const raw = await FileAttachment("data/drugs.csv").csv({ typed: true });
  const data = raw.slice(0, 2592).map((d, i) => {
    const residenceGeo = parseGeoField(d.ResidenceCityGeo);
    const injuryGeo = parseGeoField(d.InjuryCityGeo);
    const deathGeo = parseGeoField(d.DeathCityGeo);
    return {
      __row: i,
      raw: d,
      date: d["Date"],
      age: d["Age"] ? +d["Age"] : null,
      sex: d["Sex"],
      cityResidence: d["Residence City"],
      cityInjury: d["Injury City"],
      cityDeath: d["Death City"],
      residenceGeo,
      injuryGeo,
      deathGeo,
      fentanyl: flagValue(d["Fentanyl"]),
      heroin: flagValue(d["Heroin"]),
      cocaine: flagValue(d["Cocaine"]),
      xylazine: flagValue(d["Xylazine"]),
      anyOpioid: flagValue(d["Any Opioid"]),
      cause: d["Cause of Death"],
      manner: d["Manner of Death"],
      injuryPlace: d["Injury Place"],
      description: d["Description of Injury"]
    };
  });

  let roadGeoms = [];
  try {
    const roadCSV = await FileAttachment("data/connecticut_roads.csv").csv();
    roadGeoms = roadCSV
      .map(row => {
        if (!row.geometry) return null;
        try {
          const g = JSON.parse(row.geometry);
          return g && g.type === "LineString" && Array.isArray(g.coordinates) ? g : null;
        } catch {
          return null;
        }
      })
      .filter(d => d);
  } catch (error) {
    console.warn("Could not load CT roads CSV:", error);
  }

  const roadFeatures = roadGeoms.map(g => ({
    type: "Feature",
    geometry: g,
    properties: {}
  }));
  const roadsFC = { type: "FeatureCollection", features: roadFeatures };

  const projection = d3.geoMercator().fitExtent(
    [[20, 20], [width - 20, height - 20]],
    roadsFC
  );
  const path = d3.geoPath().projection(projection);

  const container = d3.create("div")
    .style("font-family", "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial")
    .style("position", "relative");

  const controls = container.append("div")
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("gap", "8px")
    .style("align-items", "center")
    .style("margin-bottom", "8px");

  controls.append("label")
    .style("font-weight", "600")
    .text("Plot geo:");

  const filterLabel = controls.append("div")
    .style("display", "inline-flex")
    .style("gap", "8px")
    .style("align-items", "center");

  filterLabel.append("span").text("Filter drugs:");

  const filters = {};
  DRUGS.forEach(drug => { filters[drug] = true; });

  DRUGS.forEach(drug => {
    const lbl = controls.append("label")
      .style("display", "inline-flex")
      .style("align-items", "center")
      .style("gap", "4px");

    lbl.append("input")
      .attr("type", "checkbox")
      .property("checked", true)
      .on("change", function () {
        filters[drug] = this.checked;
        render();
      });

    lbl.append("span").text(drug);
  });

  const onlyMatchingWrap = controls.append("label")
    .style("display", "inline-flex")
    .style("align-items", "center")
    .style("gap", "6px")
    .style("margin-left", "8px");

  const onlyMatchingInput = onlyMatchingWrap.append("input")
    .attr("type", "checkbox")
    .property("checked", false)
    .on("change", render);

  onlyMatchingWrap.append("span").text("Show only records matching checked drugs");

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("display", "block")
    .style("border", "1px solid #e6e6e6")
    .style("border-radius", "6px")
    .style("background", "#ffffff")
    .node();

  const svgSel = d3.select(svg);

  const roadsG = svgSel.append("g").attr("class", "roads");
  if (roadGeoms.length) {
    roadsG.selectAll("path")
      .data(roadGeoms)
      .join("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#cccccc")
      .attr("stroke-width", 0.7)
      .attr("pointer-events", "none");
  }

  const pointsG = svgSel.append("g").attr("class", "points");

  const tooltip = container.append("div")
    .attr("class", "overdose-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "rgba(255,255,255,0.98)")
    .style("padding", "8px 10px")
    .style("border", "1px solid #bbb")
    .style("border-radius", "6px")
    .style("box-shadow", "0 2px 8px rgba(0,0,0,0.12)")
    .style("font-size", "13px")
    .style("line-height", "1.2")
    .style("display", "none");

  svgSel.on("mouseleave", () => {
    tooltip.style("display", "none");
  });

  const legend = container.append("div")
    .attr("class", "legend")
    .style("margin-top", "8px")
    .style("display", "flex")
    .style("gap", "12px")
    .style("flex-wrap", "wrap");

  const legendRows = [
    { color: "#d73027", label: "Fentanyl" },
    { color: "#1a9850", label: "Heroin" },
    { color: "#4575b4", label: "Cocaine" },
    { color: "#feb24c", label: "Any Opioid" },
    { color: "#999999", label: "Other / none" }
  ];

  const legendRow = legend.selectAll("div.row")
    .data(legendRows)
    .join("div")
    .attr("class", "row")
    .style("display", "inline-flex")
    .style("align-items", "center")
    .style("gap", "6px");

  legendRow.append("div")
    .style("width", "14px")
    .style("height", "14px")
    .style("border-radius", "3px")
    .style("border", "1px solid #666")
    .style("background", d => d.color);

  legendRow.append("div")
    .style("font-size", "13px")
    .text(d => d.label);

  function colorFor(d) {
    if (d.fentanyl) return "#d73027";
    if (d.heroin) return "#1a9850";
    if (d.cocaine) return "#4575b4";
    if (d.anyOpioid) return "#feb24c";
    return "#999999";
  }

  const CT_BOUNDS = {
    minLat: 40.9,
    maxLat: 42.1,
    minLon: -73.8,
    maxLon: -71.7
  };

  function render() {
    tooltip.style("display", "none");

    const geoChoice = "Injury";
    const coordField = {
      Residence: "residenceGeo",
      Injury: "injuryGeo",
      Death: "deathGeo"
    }[geoChoice];

    const checkedDrugs = DRUGS.filter(d => filters[d]);
    const onlyMatching = onlyMatchingInput.property("checked");

    const visible = data.filter(d => {
      const coords = d[coordField];
      if (!coords) return false;
      const { lat, lon } = coords;
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
      if (lat < CT_BOUNDS.minLat || lat > CT_BOUNDS.maxLat ||
          lon < CT_BOUNDS.minLon || lon > CT_BOUNDS.maxLon) return false;
      if (!onlyMatching) return true;
      return checkedDrugs.some(drug => d[drug.toLowerCase()]);
    });

    console.log("visible overdose points in Connecticut bounds:", visible.length);

    const circles = pointsG.selectAll("circle")
      .data(visible, d => d.__row);

    circles.exit().remove();

    const circlesEnter = circles.enter().append("circle")
      .attr("r", 6)
      .attr("stroke", "#222")
      .attr("stroke-width", 0.5)
      .attr("fill-opacity", 0.95)
      .on("mouseover", (event, d) => {
        tooltip.style("display", "block");
        const drugsList = [
          d.fentanyl ? "Fentanyl" : null,
          d.heroin ? "Heroin" : null,
          d.cocaine ? "Cocaine" : null,
          d.xylazine ? "Xylazine" : null
        ].filter(Boolean).join(", ") || "None flagged";
        const deathLine = d.cityDeath ? "Death city: " + d.cityDeath + "<br/>" : "";
        const causeLine = d.cause ? "Cause: " + d.cause + "<br/>" : "";
        tooltip.html(
          `<strong>${d.raw["Date"] || "-"} — age ${d.age || "-"} ${d.sex || ""}</strong><br/>` +
          deathLine +
          causeLine +
          `<strong>Drugs:</strong> ${drugsList}<br/>` +
          `<em>${d.injuryPlace || ""}</em>`
        );
      })
      .on("mousemove", (event) => {
        const rect = container.node().getBoundingClientRect();
        tooltip
          .style("left", (event.clientX - rect.left + 12) + "px")
          .style("top", (event.clientY - rect.top + 12) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    circlesEnter.merge(circles)
      .attr("fill", d => colorFor(d))
      .attr("cx", d => {
        const p = d[coordField];
        return projection([p.lon, p.lat])[0];
      })
      .attr("cy", d => {
        const p = d[coordField];
        return projection([p.lon, p.lat])[1];
      });
  }

  render();
  return container.node();
}

```
<div class="grid grid-cols-1">
  <div class="card">
    ${overdoseMap()}
  </div>
</div>

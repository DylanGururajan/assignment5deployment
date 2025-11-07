import { csvFormat, csvParse } from "d3-dsv";

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return response.text();
}

// Load your local CSV
const drugs = csvParse(await text("./data/drugs.csv"));

// Optionally, you could filter or transform data here.
// e.g. drugs.forEach(d => d.year = +d.year);

// Write out csv formatted data.
process.stdout.write(csvFormat(drugs));

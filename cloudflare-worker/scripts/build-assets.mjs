import fs from "node:fs";
import path from "node:path";

const root = path.resolve("..");
const assetsDir = path.resolve("assets");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes && ch === '"' && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const header = rows[0] ?? [];
  return rows.slice(1).filter((r) => r.length > 1).map((r) => {
    const obj = {};
    for (let i = 0; i < header.length; i += 1) obj[header[i]] = r[i] ?? "";
    return obj;
  });
}

function normalizeLevel(value) {
  const text = String(value || "").trim();
  return text.toLowerCase() === "obuse" ? "Obese" : text;
}

function keyFor(row) {
  return [
    row.Sex,
    normalizeLevel(row.Level),
    row.Hypertension,
    row.Diabetes,
    row["Fitness Goal"],
    row["Fitness Type"]
  ].map((v) => String(v || "").trim().toLowerCase()).join("|");
}

fs.mkdirSync(assetsDir, { recursive: true });

const gymRows = parseCsv(fs.readFileSync(path.join(root, "backend-fastAPI", "gym recommendation (2).csv"), "utf8"));
const recommendationMap = {};

for (const row of gymRows) {
  const key = keyFor(row);
  if (!recommendationMap[key] && row.Recommendation) {
    recommendationMap[key] = row.Recommendation;
  }
}

const fallbackRecommendation = gymRows.find((row) => row.Recommendation)?.Recommendation || "No recommendation available.";

const exerciseRows = parseCsv(fs.readFileSync(path.join(root, "backend-fastAPI", "megaGymDataset.csv"), "utf8"))
  .filter((row) => row.Title && row.Type && row.BodyPart)
  .map((row) => ({
    title: row.Title,
    description: row.Desc || "",
    type: row.Type || "",
    bodyPart: row.BodyPart || "",
    equipment: row.Equipment || "",
    difficulty: row.Level || ""
  }));

fs.writeFileSync(
  path.join(assetsDir, "recommendations.json"),
  JSON.stringify({ fallbackRecommendation, recommendationMap })
);

fs.writeFileSync(
  path.join(assetsDir, "exercises.json"),
  JSON.stringify(exerciseRows)
);

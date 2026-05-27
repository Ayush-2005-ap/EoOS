import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

// ─── State Name → ISO Code Mapping ──────────────────────────────────────────
const STATE_MAP: Record<string, { id: string; type: "STATE" | "UT"; region: string }> = {
  "Andhra Pradesh":       { id: "AP", type: "STATE", region: "South" },
  "Arunachal Pradesh":    { id: "AR", type: "STATE", region: "Northeast" },
  "Assam":                { id: "AS", type: "STATE", region: "Northeast" },
  "Bihar":                { id: "BR", type: "STATE", region: "East" },
  "Chhatisgarh":          { id: "CG", type: "STATE", region: "Central" },
  "Delhi":                { id: "DL", type: "UT",    region: "North" },
  "Goa":                  { id: "GA", type: "STATE", region: "West" },
  "Gujarat":              { id: "GJ", type: "STATE", region: "West" },
  "Haryana":              { id: "HR", type: "STATE", region: "North" },
  "Himachal Pradesh":     { id: "HP", type: "STATE", region: "North" },
  "Jammu and Kashmir":    { id: "JK", type: "UT",    region: "North" },
  "Jharkhand":            { id: "JH", type: "STATE", region: "East" },
  "Karnataka":            { id: "KA", type: "STATE", region: "South" },
  "Kerala":               { id: "KL", type: "STATE", region: "South" },
  "Madhya Pradesh":       { id: "MP", type: "STATE", region: "Central" },
  "Maharashtra":          { id: "MH", type: "STATE", region: "West" },
  "Manipur":              { id: "MN", type: "STATE", region: "Northeast" },
  "Meghalaya":            { id: "ML", type: "STATE", region: "Northeast" },
  "Mizoram":              { id: "MZ", type: "STATE", region: "Northeast" },
  "Nagaland":             { id: "NL", type: "STATE", region: "Northeast" },
  "Odisha":               { id: "OD", type: "STATE", region: "East" },
  "Punjab":               { id: "PB", type: "STATE", region: "North" },
  "Rajasthan":            { id: "RJ", type: "STATE", region: "North" },
  "Sikkim":               { id: "SK", type: "STATE", region: "Northeast" },
  "Tamil Nadu":           { id: "TN", type: "STATE", region: "South" },
  "Telangana":            { id: "TG", type: "STATE", region: "South" },
  "Tripura":              { id: "TR", type: "STATE", region: "Northeast" },
  "Uttar Pradesh":        { id: "UP", type: "STATE", region: "North" },
  "Uttarakhand":          { id: "UT", type: "STATE", region: "North" },
  "West Bengal":          { id: "WB", type: "STATE", region: "East" },
};

const DOMAIN_NAMES: Record<number, string> = {
  1: "Access",
  2: "Equity",
  3: "Quality",
  4: "Infrastructure",
  5: "Governance",
  6: "Outcomes",
};

const DOMAIN_WEIGHTS: Record<number, number> = {
  1: 16, 2: 17, 3: 17, 4: 16, 5: 17, 6: 17,
};

// ─── Parse CSV ───────────────────────────────────────────────────────────────
interface ParsedSubIndicator {
  domainNum: number;
  indicatorNum: number;
  indicatorTitle: string;
  subText: string;
  scoringRule: string;
  stateScores: Record<string, { response: string; score: number }>;
}

function parseCSV(): ParsedSubIndicator[] {
  const csvPath = path.join(__dirname, "raw_data.csv");
  const content = fs.readFileSync(csvPath, "utf-8");

  const records: string[][] = parse(content, {
    relax_quotes: true,
    relax_column_count: true,
    skip_empty_lines: false,
  });

  // Extract state names from header row (row 0)
  const headerRow = records[0];
  const stateNames: string[] = [];
  // State names start at col index 2, every 2 columns (Response, Score)
  for (let i = 2; i < headerRow.length; i += 2) {
    const cell = (headerRow[i] || "").replace(" (Response)", "").trim();
    if (cell && STATE_MAP[cell]) stateNames.push(cell);
  }

  const subs: ParsedSubIndicator[] = [];
  // Pre-detect domain from first row header cell (e.g., "DOMAIN 1: Ease of ...")
  let currentDomainNum = 0;
  {
    const firstCell = (records[0][0] || "").trim();
    const m = firstCell.match(/^DOMAIN\s*(\d)|^Domain\s*(\d)/i);
    if (m) currentDomainNum = parseInt(m[1] || m[2]);
  }

  let currentIndicatorNum = 0;
  let currentIndicatorTitle = "";

  for (let rowIdx = 1; rowIdx < records.length; rowIdx++) {
    const row = records[rowIdx];
    const col0 = (row[0] || "").trim();
    const col1 = (row[1] || "").trim();

    if (!col0) continue;

    // Detect domain header rows (start with "DOMAIN" or "Domain")
    if (/^DOMAIN\s*\d|^Domain\s*\d/i.test(col0)) {
      const match = col0.match(/\d/);
      if (match) currentDomainNum = parseInt(match[0]);
      continue;
    }

    // Detect indicator rows (start with a number and a period, col1 is empty or "Scoring Rule")
    if (/^\d+\.\s/.test(col0) && (col1 === "" || col1.toLowerCase() === "scoring rule")) {
      const match = col0.match(/^(\d+)\./);
      if (match) {
        currentIndicatorNum = parseInt(match[1]);
        currentIndicatorTitle = col0;
      }
      continue;
    }

    // Skip rows with no scoring rule, or if we haven't seen a domain header yet
    if (!col1 || col1.toLowerCase() === "scoring rule" || currentDomainNum === 0) continue;

    // This is a sub-indicator row
    const stateScores: Record<string, { response: string; score: number }> = {};
    let colIdx = 2;

    for (const stateName of stateNames) {
      const response = (row[colIdx] || "").trim();
      const rawScore = (row[colIdx + 1] || "").trim();
      const score = rawScore === "" || isNaN(parseFloat(rawScore)) ? 0 : parseFloat(rawScore);
      stateScores[stateName] = { response, score };
      colIdx += 2;
    }

    subs.push({
      domainNum: currentDomainNum,
      indicatorNum: currentIndicatorNum,
      indicatorTitle: currentIndicatorTitle,
      subText: col0,
      scoringRule: col1,
      stateScores,
    });
  }

  return subs;
}

// ─── Main Seed Function ───────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting real data seed...");

  const subs = parseCSV();
  console.log(`📊 Parsed ${subs.length} sub-indicators across domains.`);

  // ── 1. Clear existing data ─────────────────────────────────────────────────
  console.log("🗑️  Clearing existing data...");
  await prisma.stateSubIndicatorData.deleteMany();
  await prisma.stateIndicatorScore.deleteMany();
  await prisma.stateDomainScore.deleteMany();
  await prisma.subIndicator.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.state.deleteMany();
  await prisma.domain.deleteMany();

  // ── 2. Seed Domains ───────────────────────────────────────────────────────
  console.log("📁 Seeding domains...");
  const uniqueDomainNums = [...new Set(subs.map((s) => s.domainNum))].sort();
  for (const domainNum of uniqueDomainNums) {
    await prisma.domain.create({
      data: {
        id: DOMAIN_NAMES[domainNum] || `Domain${domainNum}`,
        name: `Domain-${domainNum}`,
        defaultWeight: DOMAIN_WEIGHTS[domainNum] || 16,
      },
    });
  }

  // ── 3. Seed States ────────────────────────────────────────────────────────
  console.log("🗺️  Seeding states...");
  const stateNames = Object.keys(STATE_MAP);
  for (const stateName of stateNames) {
    const info = STATE_MAP[stateName];
    await prisma.state.create({
      data: {
        id: info.id,
        name: stateName,
        type: info.type,
        region: info.region,
        baseScore: 0, // will be computed below
        baseRank: 0,  // will be computed below
      },
    });
  }

  // ── 4. Seed Indicators & Sub-Indicators ───────────────────────────────────
  console.log("📋 Seeding indicators and sub-indicators...");

  // Deduplicate indicators
  const indicatorMap = new Map<string, string>(); // key → indicator DB id
  const indicatorGroups = new Map<string, typeof subs>();

  for (const sub of subs) {
    const key = `${sub.domainNum}_${sub.indicatorNum}`;
    if (!indicatorGroups.has(key)) indicatorGroups.set(key, []);
    indicatorGroups.get(key)!.push(sub);
  }

  for (const [key, group] of indicatorGroups) {
    const first = group[0];
    const indicatorId = `IND_${key}`;
    const domainId = DOMAIN_NAMES[first.domainNum] || `Domain${first.domainNum}`;

    await prisma.indicator.create({
      data: {
        id: indicatorId,
        domainId,
        name: first.indicatorTitle,
      },
    });
    indicatorMap.set(key, indicatorId);
  }

  // ── 5. Seed SubIndicators ─────────────────────────────────────────────────
  const subIndicatorIdMap = new Map<number, string>(); // index → subId

  for (let i = 0; i < subs.length; i++) {
    const sub = subs[i];
    const indicatorKey = `${sub.domainNum}_${sub.indicatorNum}`;
    const indicatorId = indicatorMap.get(indicatorKey)!;
    const subId = `SUB_${indicatorKey}_${i}`;

    await prisma.subIndicator.create({
      data: {
        id: subId,
        indicatorId,
        name: sub.subText.substring(0, 500),
        maxScore: 1.0,
      },
    });
    subIndicatorIdMap.set(i, subId);
  }

  // ── 6. Seed per-state data ────────────────────────────────────────────────
  console.log("📈 Seeding per-state scores...");

  // Accumulate domain scores per state
  const domainScoreAccum: Record<string, Record<string, number[]>> = {};

  for (const stateName of stateNames) {
    domainScoreAccum[stateName] = {};
    for (const dNum of uniqueDomainNums) {
      domainScoreAccum[stateName][DOMAIN_NAMES[dNum]] = [];
    }
  }

  for (let i = 0; i < subs.length; i++) {
    const sub = subs[i];
    const subId = subIndicatorIdMap.get(i)!;
    const indicatorKey = `${sub.domainNum}_${sub.indicatorNum}`;
    const indicatorId = indicatorMap.get(indicatorKey)!;
    const domainId = DOMAIN_NAMES[sub.domainNum];

    for (const stateName of stateNames) {
      const stateId = STATE_MAP[stateName].id;
      const { response, score } = sub.stateScores[stateName] || { response: "Not Mentioned", score: 0 };

      // StateSubIndicatorData
      await prisma.stateSubIndicatorData.create({
        data: {
          stateId,
          subIndicatorId: subId,
          score,
          status: response || "Not Mentioned",
        },
      });

      domainScoreAccum[stateName][domainId].push(score);
    }
  }

  // ── 7. Compute and seed indicator + domain scores ─────────────────────────
  console.log("🧮 Computing indicator and domain scores...");

  for (const stateName of stateNames) {
    const stateId = STATE_MAP[stateName].id;

    // StateIndicatorScore — average score across subs in each indicator
    for (const [indicatorKey, group] of indicatorGroups) {
      const indicatorId = indicatorMap.get(indicatorKey)!;
      const scores = group.map((sub) => (sub.stateScores[stateName]?.score ?? 0));
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      await prisma.stateIndicatorScore.create({
        data: {
          stateId,
          indicatorId,
          score: parseFloat((avg * 100).toFixed(2)),
        },
      });
    }

    // StateDomainScore — average score across all subs in each domain
    let weightedTotal = 0;
    const defaultWeights = { Access: 0.16, Equity: 0.17, Quality: 0.17, Infrastructure: 0.16, Governance: 0.17, Outcomes: 0.17 };

    for (const dNum of uniqueDomainNums) {
      const domainId = DOMAIN_NAMES[dNum];
      const scores = domainScoreAccum[stateName][domainId];
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const domainScore = parseFloat((avg * 100).toFixed(2));

      await prisma.stateDomainScore.create({
        data: {
          stateId,
          domainId,
          score: domainScore,
        },
      });

      weightedTotal += domainScore * (defaultWeights[domainId as keyof typeof defaultWeights] || 0.16);
    }

    // Update state baseScore
    await prisma.state.update({
      where: { id: stateId },
      data: { baseScore: parseFloat(weightedTotal.toFixed(2)) },
    });
  }

  // ── 8. Compute and update base ranks ──────────────────────────────────────
  console.log("🏆 Computing final rankings...");
  const allStates = await prisma.state.findMany({ orderBy: { baseScore: "desc" } });
  for (let i = 0; i < allStates.length; i++) {
    await prisma.state.update({
      where: { id: allStates[i].id },
      data: { baseRank: i + 1 },
    });
  }

  console.log("✅ Real data seeding complete!");
  console.log(`   ${stateNames.length} states seeded`);
  console.log(`   ${subs.length} sub-indicators processed`);
  console.log(`   ${indicatorGroups.size} indicators across ${uniqueDomainNums.length} domains`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

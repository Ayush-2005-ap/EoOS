const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_MfyvuilL75Db@ep-late-bird-apurcywa-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" } } });

async function main() {
  const stateId = "AP";
  const indicatorId = "IND_1_1";
  const subIndicators = [{ subIndicatorId: "SUB_1_1_0", score: 1 }];

  await prisma.$transaction(async (tx) => {
    // 1. Bulk update raw sub-indicator data
    for (const sub of subIndicators) {
      await tx.stateSubIndicatorData.upsert({
        where: {
          stateId_subIndicatorId: { stateId, subIndicatorId: sub.subIndicatorId },
        },
        update: { score: sub.score, status: sub.status || "Updated manually" },
        create: { stateId, subIndicatorId: sub.subIndicatorId, score: sub.score, status: sub.status || "Updated manually" },
      });
    }

    const indicator = await tx.indicator.findUnique({
      where: { id: indicatorId },
    });
    if (!indicator) throw new Error("Indicator not found");
    const domainId = indicator.domainId;

    const allSubIndsForIndicator = await tx.subIndicator.findMany({
      where: { indicatorId },
    });
    const allSubIndIds = allSubIndsForIndicator.map(s => s.id);
    
    const subIndData = await tx.stateSubIndicatorData.findMany({
      where: { stateId, subIndicatorId: { in: allSubIndIds } },
    });
    
    const indAvg = subIndData.length 
      ? subIndData.reduce((acc, curr) => acc + curr.score, 0) / subIndData.length 
      : 0;
    
    const newIndicatorScore = parseFloat((indAvg * 100).toFixed(2));

    await tx.stateIndicatorScore.upsert({
      where: { stateId_indicatorId: { stateId, indicatorId } },
      update: { score: newIndicatorScore },
      create: { stateId, indicatorId, score: newIndicatorScore },
    });

    const allIndsForDomain = await tx.indicator.findMany({
      where: { domainId },
    });
    const allIndIds = allIndsForDomain.map(i => i.id);

    const indData = await tx.stateIndicatorScore.findMany({
      where: { stateId, indicatorId: { in: allIndIds } },
    });

    const domAvg = indData.length
      ? indData.reduce((acc, curr) => acc + curr.score, 0) / indData.length
      : 0;
    
    const newDomainScore = parseFloat(domAvg.toFixed(2));

    await tx.stateDomainScore.upsert({
      where: { stateId_domainId: { stateId, domainId } },
      update: { score: newDomainScore },
      create: { stateId, domainId, score: newDomainScore },
    });

    const allDomains = await tx.domain.findMany();
    const allStateDomainScores = await tx.stateDomainScore.findMany({
      where: { stateId },
    });

    let weightedTotal = 0;
    for (const d of allDomains) {
      const dScore = allStateDomainScores.find(s => s.domainId === d.id)?.score || 0;
      weightedTotal += dScore * (d.defaultWeight / 100);
    }

    await tx.state.update({
      where: { id: stateId },
      data: { baseScore: parseFloat(weightedTotal.toFixed(2)) },
    });
  });
  console.log("Success");
}

main().catch(console.error).finally(() => prisma.$disconnect());

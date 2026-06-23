import { PrismaClient } from '@prisma/client';

async function main() {
  const neonUrl = process.env.NEON_DATABASE_URL!;
  const supabaseUrl = process.env.DATABASE_URL!;

  console.log("Initializing Prisma Clients...");
  const neonClient = new PrismaClient({
    datasources: { db: { url: neonUrl } },
  });

  const supabaseClient = new PrismaClient({
    datasources: { db: { url: supabaseUrl } },
  });

  try {
    console.log("Fetching data from Neon...");
    const states = await neonClient.state.findMany();
    const domains = await neonClient.domain.findMany();
    const indicators = await neonClient.indicator.findMany();
    const subIndicators = await neonClient.subIndicator.findMany();
    const stateDomainScores = await neonClient.stateDomainScore.findMany();
    const stateIndicatorScores = await neonClient.stateIndicatorScore.findMany();
    const stateSubIndicatorData = await neonClient.stateSubIndicatorData.findMany();
    
    const reports = await neonClient.report.findMany();
    const voices = await neonClient.voice.findMany();
    const testimonials = await neonClient.testimonial.findMany();
    const queries = await neonClient.query.findMany();
    const authors = await neonClient.author.findMany();
    const configs = await neonClient.appConfig.findMany();
    const subscribers = await neonClient.datasetSubscriber.findMany();
    const datasets = await neonClient.dataset.findMany();
    const galleries = await neonClient.galleryImage.findMany();

    console.log("Data fetched. Inserting into Supabase...");

    if (states.length) await supabaseClient.state.createMany({ data: states as any });
    console.log(`Inserted ${states.length} states.`);
    
    if (domains.length) await supabaseClient.domain.createMany({ data: domains as any });
    console.log(`Inserted ${domains.length} domains.`);
    
    if (indicators.length) await supabaseClient.indicator.createMany({ data: indicators as any });
    console.log(`Inserted ${indicators.length} indicators.`);
    
    if (subIndicators.length) await supabaseClient.subIndicator.createMany({ data: subIndicators as any });
    console.log(`Inserted ${subIndicators.length} subIndicators.`);
    
    if (stateDomainScores.length) await supabaseClient.stateDomainScore.createMany({ data: stateDomainScores as any });
    console.log(`Inserted ${stateDomainScores.length} stateDomainScores.`);
    
    if (stateIndicatorScores.length) await supabaseClient.stateIndicatorScore.createMany({ data: stateIndicatorScores as any });
    console.log(`Inserted ${stateIndicatorScores.length} stateIndicatorScores.`);
    
    if (stateSubIndicatorData.length) await supabaseClient.stateSubIndicatorData.createMany({ data: stateSubIndicatorData as any });
    console.log(`Inserted ${stateSubIndicatorData.length} stateSubIndicatorData.`);

    if (reports.length) await supabaseClient.report.createMany({ data: reports as any });
    if (voices.length) await supabaseClient.voice.createMany({ data: voices as any });
    if (testimonials.length) await supabaseClient.testimonial.createMany({ data: testimonials as any });
    if (queries.length) await supabaseClient.query.createMany({ data: queries as any });
    if (authors.length) await supabaseClient.author.createMany({ data: authors as any });
    if (configs.length) await supabaseClient.appConfig.createMany({ data: configs as any });
    if (subscribers.length) await supabaseClient.datasetSubscriber.createMany({ data: subscribers as any });
    if (datasets.length) await supabaseClient.dataset.createMany({ data: datasets as any });
    if (galleries.length) await supabaseClient.galleryImage.createMany({ data: galleries as any });

    console.log("All base models inserted successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await neonClient.$disconnect();
    await supabaseClient.$disconnect();
  }
}

main();

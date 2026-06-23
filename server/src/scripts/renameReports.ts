import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

  console.log("Renaming Reports...");
  const reports = await prisma.report.findMany();
  for (const r of reports) {
    if (r.pdfPath && r.pdfPath.includes('supabase.co') && !r.pdfPath.endsWith('.pdf')) {
      const pathParts = r.pdfPath.split('eoos-media/');
      if (pathParts.length < 2) continue;
      const oldFileName = pathParts[1]; // e.g. "reports/1782209511149-uewldgsoq83ql3hvxach"
      const newFileName = `${oldFileName}.pdf`;
      
      console.log(`Renaming ${oldFileName} to ${newFileName} in Supabase...`);
      const moveRes = await fetch(`${supabaseUrl}/storage/v1/object/move`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: 'eoos-media',
          sourceKey: oldFileName,
          destinationKey: newFileName
        })
      });

      if (!moveRes.ok) {
        console.error(`Failed to move: await ${await moveRes.text()}`);
        continue;
      }

      const newUrl = `${supabaseUrl}/storage/v1/object/public/eoos-media/${newFileName}`;
      console.log(`Updating DB for report ${r.id} to ${newUrl}...`);
      await prisma.report.update({
        where: { id: r.id },
        data: { pdfPath: newUrl }
      });
    }
  }

  console.log("Renaming complete!");
}

main().catch(console.error);

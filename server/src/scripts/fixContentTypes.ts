import { PrismaClient } from '@prisma/client';
import path from 'path';

async function main() {
  const prisma = new PrismaClient();
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  async function updateContentType(url: string, isPdf: boolean): Promise<boolean> {
    if (!url || !url.includes('supabase.co')) return false;

    try {
      console.log(`Downloading ${url}...`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract file path from URL
      // e.g. https://sxboxrmzsilumolzgkzr.supabase.co/storage/v1/object/public/eoos-media/reports/1782208077582-report2.pdf
      const pathParts = url.split('eoos-media/');
      if (pathParts.length < 2) return false;
      const fileName = pathParts[1];

      const contentType = isPdf ? 'application/pdf' : 
                          fileName.endsWith('.png') ? 'image/png' : 
                          fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? 'image/jpeg' : 
                          fileName.endsWith('.mp4') ? 'video/mp4' : 
                          'application/octet-stream';

      console.log(`Uploading to Supabase: ${fileName} with Content-Type: ${contentType}...`);
      
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/eoos-media/${fileName}`, {
        method: 'POST', // or POST with x-upsert
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': contentType,
          'x-upsert': 'true'
        },
        body: buffer as any
      });

      if (!uploadRes.ok) {
        // try PUT if POST fails for upsert
        const putRes = await fetch(`${supabaseUrl}/storage/v1/object/eoos-media/${fileName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': contentType,
            'x-upsert': 'true'
          },
          body: buffer as any
        });
        if (!putRes.ok) throw new Error(`Failed to upload: await ${await putRes.text()}`);
      }
      
      return true;
    } catch (e: any) {
      console.error(`Error updating ${url}: ${e.message}`);
      return false;
    }
  }

  console.log("Fixing Reports...");
  const reports = await prisma.report.findMany();
  for (const r of reports) {
    if (r.pdfPath) {
      await updateContentType(r.pdfPath, true);
      await delay(500);
    }
  }

  console.log("Fixing States...");
  const states = await prisma.state.findMany();
  for (const s of states) {
    if (s.pdfUrl) {
      await updateContentType(s.pdfUrl, true);
      await delay(500);
    }
  }

  // we can also do gallery, testimonials, voices if we want
  // but let's see if this works first

  console.log("Content type fix complete!");
}

main().catch(console.error);

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Note: Requires native fetch in Node 18+
async function main() {
  const prisma = new PrismaClient();
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

  console.log("Creating bucket 'eoos-media' if it doesn't exist...");
  await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: 'eoos-media', name: 'eoos-media', public: true })
  }).catch(() => {});

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  async function uploadFromUrl(url: string, prefix: string): Promise<string | null> {
    if (!url) return null;
    if (url.includes('supabase.co')) return url;

    try {
      let buffer: Buffer;
      let originalName = path.basename(url).split('?')[0];
      if (!originalName) originalName = 'file';

      if (url.startsWith('http')) {
        console.log(`Downloading ${url}...`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        // Local file
        const fullPath = path.join(__dirname, "../../../public", url);
        if (!fs.existsSync(fullPath)) {
          console.warn(`Local file missing: ${fullPath}`);
          return null;
        }
        buffer = fs.readFileSync(fullPath);
      }

      const fileName = `${prefix}/${Date.now()}-${originalName}`;
      console.log(`Uploading to Supabase: ${fileName}...`);
      
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/eoos-media/${fileName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/octet-stream'
        },
        body: buffer as any
      });

      if (!uploadRes.ok) throw new Error(`Failed to upload: await ${uploadRes.text()}`);
      
      return `${supabaseUrl}/storage/v1/object/public/eoos-media/${fileName}`;
    } catch (e: any) {
      console.error(`Error migrating ${url}: ${e.message}`);
      return null;
    }
  }

  console.log("Migrating Reports...");
  const reports = await prisma.report.findMany();
  for (const r of reports) {
    if (r.pdfPath && !r.pdfPath.includes('supabase.co')) {
      const newUrl = await uploadFromUrl(r.pdfPath, 'reports');
      if (newUrl) {
        await prisma.report.update({ where: { id: r.id }, data: { pdfPath: newUrl } });
      }
      await delay(500);
    }
  }

  console.log("Migrating Gallery...");
  const gallery = await prisma.galleryImage.findMany();
  for (const g of gallery) {
    if (g.imageUrl && !g.imageUrl.includes('supabase.co')) {
      const newUrl = await uploadFromUrl(g.imageUrl, 'gallery');
      if (newUrl) {
        await prisma.galleryImage.update({ where: { id: g.id }, data: { imageUrl: newUrl, publicId: newUrl.split('/').pop() } });
      }
      await delay(500);
    }
  }

  console.log("Migrating Voices...");
  const voices = await prisma.voice.findMany();
  for (const v of voices) {
    let updated = false;
    let newThumb = v.thumbnailPath;
    let newVid = v.videoUrl;

    if (v.thumbnailPath && !v.thumbnailPath.includes('supabase.co')) {
      newThumb = await uploadFromUrl(v.thumbnailPath, 'voices') || v.thumbnailPath;
      if (newThumb !== v.thumbnailPath) updated = true;
    }
    if (v.videoUrl && !v.videoUrl.includes('supabase.co') && !v.videoUrl.includes('youtube.com')) {
      newVid = await uploadFromUrl(v.videoUrl, 'voices') || v.videoUrl;
      if (newVid !== v.videoUrl) updated = true;
    }
    
    if (updated) {
      await prisma.voice.update({ where: { id: v.id }, data: { thumbnailPath: newThumb, videoUrl: newVid } });
    }
    await delay(500);
  }

  console.log("Migrating Testimonials...");
  const testimonials = await prisma.testimonial.findMany();
  for (const t of testimonials) {
    if (t.avatarUrl && !t.avatarUrl.includes('supabase.co')) {
      const newUrl = await uploadFromUrl(t.avatarUrl, 'avatars');
      if (newUrl) {
        await prisma.testimonial.update({ where: { id: t.id }, data: { avatarUrl: newUrl } });
      }
      await delay(500);
    }
  }

  console.log("Migrating Authors...");
  const authors = await prisma.author.findMany();
  for (const a of authors) {
    if (a.avatarUrl && !a.avatarUrl.includes('supabase.co')) {
      const newUrl = await uploadFromUrl(a.avatarUrl, 'avatars');
      if (newUrl) {
        await prisma.author.update({ where: { id: a.id }, data: { avatarUrl: newUrl } });
      }
      await delay(500);
    }
  }

  console.log("Migrating States...");
  const states = await prisma.state.findMany();
  for (const s of states) {
    if (s.pdfUrl && !s.pdfUrl.includes('supabase.co')) {
      const newUrl = await uploadFromUrl(s.pdfUrl, 'state_profiles');
      if (newUrl) {
        await prisma.state.update({ where: { id: s.id }, data: { pdfUrl: newUrl } });
      }
      await delay(500);
    }
  }

  console.log("File migration complete!");
}

main().catch(console.error);

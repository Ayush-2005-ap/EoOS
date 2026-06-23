const fs = require('fs');
async function run() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  console.log("Creating bucket...");
  let res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'eoos-media', name: 'eoos-media', public: true })
  });
  console.log(await res.text());
  
  console.log("Uploading test file...");
  res = await fetch(`${supabaseUrl}/storage/v1/object/eoos-media/test.txt`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'text/plain' },
    body: "test"
  });
  console.log(await res.text());
}
run();

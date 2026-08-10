const fs = require('fs');
const { Readable } = require('stream');

async function test() {
  fs.writeFileSync('dummy.txt', 'hello world');
  const stream = fs.createReadStream('dummy.txt');
  const webStream = Readable.toWeb(stream);
  
  const res = await fetch('https://httpbin.org/post', {
    method: 'POST',
    body: webStream,
    duplex: 'half'
  });
  const data = await res.json();
  console.log('Success:', data.data);
  fs.unlinkSync('dummy.txt');
}
test().catch(console.error);

import https from 'https';

const url = 'https://www.forcold.it/it/prodotti/insalate-e-pizza-gn-1-1/g-s900-fc';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const matches = data.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|png|jpeg|webp)/gi);
    console.log('Matches:', matches ? [...new Set(matches)].slice(0, 10) : 'None');
  });
}).on('error', e => console.error(e));

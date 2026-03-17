const https = require('https');
const fs = require('fs');

const url = 'https://epg.pw/test_channels.m3u';

https.get(url, res => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {
    const lines = data.split('\n');
    const result = [];

    let current = {};

    lines.forEach(line => {
      line = line.trim();

      if (line.startsWith('#EXTINF')) {
        const name = line.split(',')[1];
        current = { name: name || '' };
      } else if (line && !line.startsWith('#')) {
        current.url = line;
        result.push(current);
        current = {};
      }
    });

    // ✅ 1. 保存 JSON
    fs.writeFileSync('channels.json', JSON.stringify(result, null, 2));

    // ✅ 2. 转 M3U
    let m3u = '#EXTM3U\n';
    result.forEach(ch => {
      if (ch.name && ch.url) {
        m3u += `#EXTINF:-1,${ch.name}\n${ch.url}\n`;
      }
    });

    fs.writeFileSync('channels.m3u', m3u);

    // ✅ 3. TVBox 源
    const tvbox = {
      lives: [
        {
          name: "My IPTV",
          type: 0,
          url: "file:///storage/emulated/0/Download/channels.m3u"
        }
      ]
    };

    fs.writeFileSync('tvbox.json', JSON.stringify(tvbox, null, 2));

    console.log("✅ 完成：channels.json + channels.m3u + tvbox.json");
  });

}).on('error', err => {
  console.error('Error:', err.message);
});
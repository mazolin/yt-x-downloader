import youtubedl from 'youtube-dl-exec';

const url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"; // Me at the zoo

console.log("Starting test...");

youtubedl(url, {
  dumpSingleJson: true,
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true,
  addHeader: [
    "referer:youtube.com",
    "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ]
}).then(output => console.log('success, output length:', JSON.stringify(output).length))
  .catch(err => {
    console.error('ERROR OBJECT KEYS:', Object.keys(err));
    console.error('ERROR MESSAGE:', err.message);
    if (err.stderr) console.error('STDERR:', err.stderr);
    if (err.stdout) console.error('STDOUT:', err.stdout);
  });

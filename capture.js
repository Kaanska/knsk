const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const files = [
    'render_p395.html', 'render_p396.html', 'render_p397.html', 'render_p398.html', 'render_p399.html',
    'render_p400.html', 'render_p401.html', 'render_p402.html', 'render_p403.html', 'render_p404.html',
    'render_p405.html', 'render_p406.html', 'render_p407.html', 'render_p408.html', 'render_p409.html'
  ];

  await page.setViewport({
    width: 1080,
    height: 1350,
    deviceScaleFactor: 2
  });

  for (const file of files) {
    const filePath = path.resolve(__dirname, file);
    const fileUrl = `file://${filePath}`;

    console.log(`Processing ${file}...`);
    try {
      await page.goto(fileUrl, { waitUntil: 'networkidle0' });
      // Extra wait for some complex animations/particles to settle or start
      await new Promise(r => setTimeout(r, 1500));
      const outputName = file.replace('render_', 'post_').replace('.html', '.png');
      await page.screenshot({ path: outputName, omitBackground: true });
      console.log(`Saved ${outputName}`);
    } catch (e) {
      console.error(`Error on ${file}: ${e.message}`);
    }
  }

  await browser.close();
})();

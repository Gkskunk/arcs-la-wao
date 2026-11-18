import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const storyDirectory = path.dirname(fileURLToPath(import.meta.url));
const appDirectory = path.resolve(storyDirectory, '../..');
const buildDirectory = path.join(storyDirectory, '.render/30s');
const publicDirectory = path.join(appDirectory, 'public/story-studio');
const videoPath = path.join(publicDirectory, 'arcs-origin-story-30s.mp4');
const posterPath = path.join(publicDirectory, 'arcs-origin-story-30s-poster.jpg');
const captionPath = path.join(publicDirectory, 'arcs-origin-story-30s.vtt');

mkdirSync(buildDirectory, { recursive: true });
mkdirSync(publicDirectory, { recursive: true });

const scenes = [
  {
    eyebrow: 'LOS ANGELES · 1957',
    title: ['A question', 'crosses the sky.'],
    subtitle: 'Who would support the next generation of scientists?',
    narration: 'Los Angeles, 1957. Sputnik crossed the sky, and four women asked: who would support America’s next generation of scientists?',
    art: `<g transform="translate(1220 135)"><ellipse cx="210" cy="285" rx="300" ry="95" fill="none" stroke="#a95f3f" stroke-width="3" transform="rotate(-18 210 285)"/><circle cx="210" cy="285" r="55" fill="#e8dcc5" stroke="#263d3b" stroke-width="5"/><path d="M175 245 L105 160 M245 245 L320 155 M175 325 L95 410 M245 325 L330 420" stroke="#e8dcc5" stroke-width="8"/><circle cx="80" cy="120" r="5" fill="#e8dcc5"/><circle cx="500" cy="80" r="4" fill="#e8dcc5"/><circle cx="440" cy="430" r="6" fill="#a95f3f"/></g>`
  },
  {
    eyebrow: 'FOUR FOUNDERS · SCIENTIFIC COUNSEL',
    title: ['“egg heads', 'and socialites”'],
    subtitle: 'Editorial framing · not a source quotation',
    narration: 'Florence Malouf, Irene Slagel, Alice Tyler, and Helene Wooldridge sought counsel from Caltech president Lee DuBridge—an alliance, in our telling, of egg heads and socialites.',
    art: `<g transform="translate(1115 130) rotate(-2 310 320)"><rect width="650" height="625" rx="8" fill="#e9dfca" stroke="#7b7165"/><path d="M0 105 H650 M0 225 H650 M0 345 H650 M0 465 H650" stroke="#b9ac96"/><text x="45" y="72" font-family="Georgia" font-size="35" fill="#173e3c">FLORENCE MALOUF</text><text x="45" y="192" font-family="Georgia" font-size="35" fill="#173e3c">IRENE SLAGEL</text><text x="45" y="312" font-family="Georgia" font-size="35" fill="#173e3c">ALICE TYLER</text><text x="45" y="432" font-family="Georgia" font-size="35" fill="#173e3c">HELENE WOOLDRIDGE</text><text x="45" y="545" font-family="Arial" font-size="24" letter-spacing="3" fill="#a95f3f">CALTECH · LEE DuBRIDGE</text></g>`
  },
  {
    eyebrow: 'A FOUNDATION TAKES FORM',
    title: ['September 5,', '1958'],
    subtitle: '53 leaders · one first membership',
    narration: 'On September 5, 1958, Achievement Rewards for College Scientists was incorporated in California. Soon, 53 philanthropic leaders formed its first membership, connecting civic leadership with scientific possibility.',
    art: `<g transform="translate(1110 105)"><g transform="rotate(-2 250 320)"><rect width="500" height="650" fill="#eee5d2" stroke="#6f695f" stroke-width="3"/><text x="45" y="75" font-family="Georgia" font-size="28" fill="#173e3c">ARTICLES OF INCORPORATION</text><path d="M45 125 H455 M45 175 H425 M45 225 H450 M45 275 H395 M45 325 H440" stroke="#9d9588" stroke-width="4"/><circle cx="380" cy="510" r="70" fill="none" stroke="#a95f3f" stroke-width="7"/><text x="342" y="503" font-family="Georgia" font-size="22" fill="#a95f3f">SEP 5</text><text x="347" y="535" font-family="Georgia" font-size="22" fill="#a95f3f">1958</text></g><g fill="#d7dfd1" transform="translate(520 90)">${Array.from({length:53},(_,index)=>{const column=index%8;const row=Math.floor(index/8);return `<circle cx="${30+column*47+(row%2)*12}" cy="${25+row*52}" r="7"/>`;}).join('')}</g><path d="M530 515 Q700 330 850 515" fill="none" stroke="#e8dcc5" stroke-width="14"/><path d="M520 520 H870" stroke="#a95f3f" stroke-width="5"/><text x="515" y="610" font-family="Arial" font-size="18" letter-spacing="2" fill="#d3dfca">SOURCE · LOS-ANGELES.ARCSFOUNDATION.ORG</text></g>`
  }
];

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function renderSceneSvg(scene, index) {
  const titleLines = scene.title.map((line, lineIndex) => `<tspan x="145" dy="${lineIndex === 0 ? 0 : 108}">${escapeXml(line)}</tspan>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs><radialGradient id="bg"><stop offset="0" stop-color="#264b48"/><stop offset="1" stop-color="#132c2b"/></radialGradient><filter id="grain"><feTurbulence baseFrequency=".75" numOctaves="2" seed="${index+31}"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .08 0"/></filter></defs>
  <rect width="1920" height="1080" fill="url(#bg)"/><rect width="1920" height="1080" filter="url(#grain)" opacity=".35"/>
  <rect x="75" y="70" width="1770" height="940" fill="none" stroke="#d3dfca" stroke-opacity=".25"/>
  <text x="145" y="155" font-family="Arial" font-size="25" letter-spacing="7" fill="#d3dfca">${escapeXml(scene.eyebrow)}</text>
  <text x="145" y="380" font-family="Georgia, serif" font-size="92" fill="#f1eadb">${titleLines}</text>
  <text x="150" y="690" font-family="Arial" font-size="30" fill="#c7d5c1">${escapeXml(scene.subtitle)}</text>
  <text x="150" y="948" font-family="Arial" font-size="19" letter-spacing="2" fill="#aabbb0">ARCS LA WAO · STORY STUDIO DEMONSTRATION · DRAFT FOR INTERNAL REVIEW</text>
  <circle cx="1770" cy="940" r="28" fill="#a95f3f"/><text x="1761" y="949" font-family="Georgia" font-size="25" fill="#f1eadb">${index+1}</text>
  ${scene.art}</svg>`;
}

function run(command, argumentsList) {
  execFileSync(command, argumentsList, { stdio: 'inherit' });
}

const videoInputs = [];
const narrationInputs = [];
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
for (const [index, scene] of scenes.entries()) {
  const number = String(index + 1).padStart(2, '0');
  const pngPath = path.join(buildDirectory, `scene-${number}.png`);
  const clipPath = path.join(buildDirectory, `scene-${number}.mp4`);
  const speechPath = path.join(buildDirectory, `scene-${number}.aiff`);
  const paddedSpeechPath = path.join(buildDirectory, `scene-${number}.wav`);
  await page.setContent(`<style>html,body{margin:0;background:#132c2b;overflow:hidden}svg{display:block}</style>${renderSceneSvg(scene, index)}`);
  await page.screenshot({ path: pngPath, type: 'png' });
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-loop', '1', '-i', pngPath, '-t', '10', '-vf', `scale=1920:1080,zoompan=z='min(zoom+0.00034,1.03)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=300:s=1920x1080:fps=30,fade=t=in:st=0:d=0.4,fade=t=out:st=9.6:d=0.4,format=yuv420p`, '-an', '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', clipPath]);
  run('say', ['-v', 'Samantha', '-r', '178', '-o', speechPath, scene.narration]);
  run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', speechPath, '-af', 'highpass=f=90,lowpass=f=11000,loudnorm=I=-17:TP=-2:LRA=7,apad=pad_dur=10,atrim=duration=10', '-ar', '48000', '-ac', '2', paddedSpeechPath]);
  videoInputs.push(`file '${clipPath.replaceAll("'", "'\\''")}'`);
  narrationInputs.push(`file '${paddedSpeechPath.replaceAll("'", "'\\''")}'`);
}
await browser.close();

const videoListPath = path.join(buildDirectory, 'video-list.txt');
const narrationListPath = path.join(buildDirectory, 'narration-list.txt');
const silentVideoPath = path.join(buildDirectory, 'silent-video.mp4');
const narrationPath = path.join(buildDirectory, 'narration.wav');
writeFileSync(videoListPath, videoInputs.join('\n'));
writeFileSync(narrationListPath, narrationInputs.join('\n'));
run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', videoListPath, '-c', 'copy', silentVideoPath]);
run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', narrationListPath, '-c', 'copy', narrationPath]);
run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', silentVideoPath, '-i', narrationPath, '-f', 'lavfi', '-i', 'sine=frequency=110:sample_rate=48000:duration=30', '-f', 'lavfi', '-i', 'sine=frequency=165:sample_rate=48000:duration=30', '-filter_complex', '[2:a]volume=0.012[bed1];[3:a]volume=0.006[bed2];[bed1][bed2]amix=inputs=2:duration=longest,lowpass=f=420[bed];[1:a]volume=1.18[narration];[narration][bed]amix=inputs=2:duration=first:dropout_transition=2[audio]', '-map', '0:v:0', '-map', '[audio]', '-t', '30', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-metadata', 'title=Egg Heads & Socialites: The Origin of ARCS Los Angeles — 30-second Story Studio demonstration', '-metadata', 'comment=Draft internal-review preview; historical reference: ARCS Foundation Los Angeles Founder Chapter history page.', videoPath]);
run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-ss', '00:00:03', '-i', videoPath, '-frames:v', '1', '-q:v', '2', posterPath]);
copyFileSync(path.join(storyDirectory, 'arcs-origin-story-30s.vtt'), captionPath);

console.log(videoPath);

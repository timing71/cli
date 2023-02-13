import { createIframe, REPLAY_FRAME_REGEX } from '@timing71/common';
import archiver from 'archiver';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';
import process from 'process';
import cliProgress from 'cli-progress';

export const finaliseCommand = async (sourceDirectory) => {
  if (!fs.existsSync(sourceDirectory)) {
    throw new Error(`Directory ${sourceDirectory} does not exist!`);
  }

  const manifestPath = path.join(sourceDirectory, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Directory ${sourceDirectory} does not contain a manifest.json - is this the correct path?`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath));

  if (manifest.startTime > 10000000000) {
    // convert from JS timestamp (millis) to Unix one (seconds)
    manifest.startTime = Math.floor(manifest.startTime / 1000);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  }

  const startTime = new Date(manifest.startTime * 1000);
  const outputFilename = `${format(startTime, 'yyyy-MM-dd HH-mm')} ${manifest.name} - ${manifest.description}.zip`;
  const dest = path.join(process.cwd(), outputFilename);

  const output = fs.createWriteStream(dest);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);

  archive.append(fs.createReadStream(manifestPath), { name: 'manifest.json' });

  const frames = fs.readdirSync(sourceDirectory).filter(f => REPLAY_FRAME_REGEX.test(f));

  frames.sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10)
  );

  let prevState = null;

  const progressBar = new cliProgress.SingleBar({
    format: 'Finalising frame {value}/{total} [{bar}] {percentage}% (ETA: {eta}s)'
  });

  progressBar.start(frames.length, 0);

  await Promise.all(
    frames.map(
      async (f, idx) => {
        const framePath = path.join(sourceDirectory, f);
        const frame = JSON.parse(fs.readFileSync(framePath));

        if (idx % 10 === 0) {
          // write a keyframe
          archive.file(framePath, { name: f })
        }
        else {
          const delta = createIframe(prevState, frame);
          const timestamp = f.substring(0, f.indexOf('.'));
          const filename = `${timestamp}i.json`;

          archive.append(
            JSON.stringify(delta),
            { name: filename }
          );

        }

        prevState = frame;
        progressBar.increment();
      }
    )
  );

  progressBar.stop();

  await archive.finalize();

  // fs.rmSync(sourceDirectory, { recursive: true, force: true });

  console.log(`Created ${dest}`);
}

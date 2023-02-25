import { Replay } from '@timing71/common';
import { createAnalyser } from '@timing71/common/analysis';
import cliProgress from 'cli-progress';
import fs from 'fs';
import StreamZip from 'node-stream-zip';

class CLIReplay extends Replay {

  async listEntries() {
    return Object.values(await this._file.entries()).map(
      e => ({ ...e, filename: e.name })
    );
  }

  async readEntry(entry) {
    const data = await this._file.entryData(entry.name);
    return JSON.parse(data.toString());
  }
}

export const analyseCommand = (replayFile) => {
  const zip = new StreamZip.async({ file: replayFile });
  const replay = new CLIReplay(zip);

  const analyser = createAnalyser(null, false);

  const progressBar = new cliProgress.SingleBar({
    format: 'Analysing frame {value}/{total} [{bar}] {percentage}% (ETA: {eta}s)'
  });

  replay._init().then(
    () => {

      progressBar.start(
        Object.keys(replay._keyframes).length + Object.keys(replay._iframes).length,
        0
      );

      let prevFrame = null;
      replay.forEachFrame(
        (frame, timestamp) => {
          analyser.updateState(prevFrame, frame, timestamp);
          prevFrame = frame;
          progressBar.increment();
        }
      ).then(
        () => {
          progressBar.stop();
          const outFile = replayFile.replace(/\.zip$/, '.json');
          fs.writeFileSync(
            outFile,
            JSON.stringify(analyser.toJSON())
          );
          console.log(`Created analysis file ${outFile}`);
        }
      );
    }
  );
}

import fs from 'fs';

export class Recorder {
  constructor(uuid) {
    this.uuid = uuid;
    this._startTime = null;
    this._manifest = null;
  }

  get outputDirectory() {
    return `./recordings/${this.uuid}`;
  }

  ensureDirectory() {
    if (!fs.existsSync(this.outputDirectory)) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }
  }

  addFrame(state) {
    const filename = `0${Math.floor(state.lastUpdated / 1000)}.json`;
    this._writeFile(filename, state);
    if (!this._startTime && state.lastUpdated) {
      this._startTime = Math.floor(state.lastUpdated / 1000);
      console.log(`Set start time of recording to ${this._startTime}`);
      if (this._manifest) {
        // Rewrite the manifest if we've already written it
        this.writeManifest(this._manifest);
      }
    }
  }

  writeManifest(manifest) {
    this._manifest = {
      ...manifest,
      startTime: this._startTime || manifest.startTime,
      version: 1
    };

    this._writeFile('manifest.json', fullManifest);
  }

  _writeFile(filename, data) {
    this.ensureDirectory();
    const output = `${this.outputDirectory}/${filename}`;

    fs.writeFileSync(
      output,
      JSON.stringify(data)
    );
  }
}

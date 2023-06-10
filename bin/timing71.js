#!/usr/bin/env node

import { ReadableStream, TransformStream } from 'web-streams-polyfill/dist/ponyfill.es2018.mjs';
// @zip.js/zip.js needs these to be available
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;

import EventSource from 'eventsource';
global.EventSource = EventSource;

// use async import so the polyfill above takes effect before @zip.js gets imported
import('../src/index.js').then(
  ({ main }) => main(process.argv)
);

import { dayjs, dasherizeParts, timeInSeconds, timeWithHours } from '@timing71/common';
import chalk from 'chalk';
import columnify from 'columnify';

export const renderTable = (state) => {
  console.clear();

  const topLine = [
    state.session?.timeElapsed ? `${timeWithHours(state.session?.timeElapsed)} elapsed` : null,
    `Flag: ${state.session?.flagState}`,
    dasherizeParts(state.manifest?.name, state.manifest?.description),
    state.session?.lapsRemain ?
      `${state.session.lapsRemain} lap${state.session.lapsRemain === 1 ? '' : 's'} remaining` :
      state.session?.timeRemain ?
        `${timeWithHours(state.session?.timeRemain)} remaining` :
        null
  ].filter(part => !!part);

  console.log(topLine.join('\t'))
  console.log();

  const colSpec = state.manifest?.colSpec || [];
  const mapper = mapCarToTable(colSpec);

  const config = {
    0: {
      align: 'right'
    }
  };

  colSpec.forEach(
    (stat, idx) => {
      if (stat[1] !== 'text' && stat[1] !== 'class') {
        config[idx + 1] = { align: 'right' }
      }
    }
  )

  const table = columnify(
    (state.cars || []).map(mapper),
    {
      columnSplitter: ' | ',
      config,
      headingTransform: (idx) => chalk.bold(idx == 0 ? 'Pos' : colSpec[idx - 1]?.[0] || idx),
      maxWidth: 24,
      truncate: true
    }
  );
  console.log(table);

  console.log();

  console.log('-------------------------------- Messages --------------------------------');
  const msgsTable = columnify(
    state.messages.slice(0, 10).map(m => ({ timestamp: m[0], category: m[1], message: m[2] })),
    {
      columnSplitter: '   ',
      config: {
        timestamp: {
          dataTransform: (ts) => chalk.cyan(dayjs(parseInt(ts, 10)).format('HH:mm:ss'))
        }
      },
      showHeaders: false
    }
  )

  console.log(msgsTable);
}

const mapCarToTable = (colSpec = []) => (car, idx) => ([
  chalk.cyan(idx + 1),
  ...colSpec.map((stat, idx) => mapStatToTable(stat, car[idx]))
]);

const mapStatToTable = (stat, value) => {
  if (Array.isArray(value)) {

    const formattedValue = formatValue(value[0], stat[1]);

    if (value[1] == 'sb') {
      return chalk.magenta(formattedValue);
    }
    if (value[1] == 'pb') {
      return chalk.green(formattedValue);
    }
    if (value[1] == 'old') {
      return chalk.yellow(formattedValue);
    }
    return formattedValue;
  }

  if (stat[0] === 'State') {
    if (value === 'PIT') {
      return chalk.red(value);
    }
    if (value === 'OUT') {
      return chalk.yellow(value);
    }
    if (value === 'RUN') {
      return chalk.green(value);
    }
  }

  return formatValue(value, stat[1]);
}

const formatValue = (value, type) => {
  if (type === 'time' || type === 'laptime') {
    return timeInSeconds(value, 3);
  }
  return value;
}

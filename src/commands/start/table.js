import { dasherizeParts, timeWithHours } from '@timing71/common';

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

  console.table(
    [
      (state.manifest?.colSpec || []).map(m => m[0]),
      ...(state.cars || []).map(
        car => car.map(
          (value) => {
            if (Array.isArray(value)) {
              return value[0] || '';
            }
            return value || '';
          }
        )
      )
    ]
  );
}

module.exports = (dts, { classes, fileName, logger }) => {
  try {
    logger.log(dts, classes, fileName)
    logger.log('poopy')
    logger.log('dts:')
    logger.log(dts)

    logger.log('fileName:')
    logger.log(fileName)

    logger.log('classes:')
    logger.log(classes)
    // console.log(dts, classes, fileName) 
    // ...generate your template here.
    return [
    '/* eslint-disable */',
    dts,
    'export const __cssModule: true;',
    `export type AllClassNames = '${Object.keys(classes).join("' | '")}';`,
  ].join('\n');
  } catch (error) {
    logger.error(error.message);
  }
};
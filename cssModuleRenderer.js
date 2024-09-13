module.exports = (css, { fileName, logger }) => {
  try {
    // ...process your css here.
    console.log(fileName, css)
    logger.log(fileName, css)

    // `string`
    return css;
  } catch (error) {
    logger.error(error.message);
  }
};
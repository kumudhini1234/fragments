const { createSuccessResponse } = require('../../response');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  // Early return if req.body is not a Buffer
  if (!Buffer.isBuffer(req.body)) {
    logger.warn('Content-Type is not supported for POST');
    return res
      .status(415)
      .json(
        createErrorResponse(
          415,
          'The Content-Type of the fragment being sent with the request is not supported'
        )
      );
  }

  // Proceed with the rest of the code if req.body is a Buffer
  logger.info('v1/fragments POST route works');

  // Get the headers from the request
  const headers = req.headers;
  // Access specific header properties
  const contentType = headers['content-type'];

  // Create a new fragment
  let fragmentData = new Fragment({
    ownerId: req.user,
    type: contentType,
    size: req.body.length,
  });
  logger.debug({ fragmentData }, 'A fragment is created');

  const host = process.env.API_URL || req.headers.host;

  // ADD Location header
  res.location(host + `/v1/fragments/${fragmentData.id}`);

  // Save fragment metadata
  await fragmentData.save();
  // Save fragment data
  await fragmentData.setData(req.body);

  // Respond with success
  res.status(201).json(createSuccessResponse({ fragment: fragmentData }));
};
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Create a new fragment for the current user
 */
module.exports = async (req, res) => {
  logger.info('Received a POST request to /fragments');

  // Get Content-Type from request headers
  const type = req.headers['content-type'];

  // Validate if the Content-Type is supported
  if (!Fragment.isSupportedType(type)) {
    logger.warn(`Unsupported Content-Type: ${type}`);
    return res.status(415).json(createErrorResponse(415, 'Unsupported Content-Type'));
  }

  // Validate request body
  if (!req.body || req.body.length === 0) {
    logger.warn('Request body is missing or empty');
    return res.status(400).json(createErrorResponse(400, 'Invalid request body'));
  }

  const hashedEmail = req.user;
  const fragmentParameter = {
    ownerId: hashedEmail,
    type,
  };

  // const fragment = new Fragment(fragmentParameter);
  // try {
  //   // Save metadata and actual data
  //   await fragment.save();
  //   await fragment.setData(req.body);
  // } catch (err) {
  //   logger.error({ message: err.message }, 'Error saving fragment during POST');
  //   return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  // }

  const fragment = new Fragment(fragmentParameter);
  try {
    await fragment.save();
    logger.debug({ id: fragment.id }, 'Metadata saved for fragment');

    await fragment.setData(req.body);
    logger.debug({ id: fragment.id, size: req.body.length }, 'Data saved to S3 for fragment');
  } catch (err) {
    logger.error({ message: err.message, stack: err.stack }, 'Error saving fragment during POST');
    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }

  // Set the Location header for the created fragment
  const locationBase = `http://${req.headers.host}`;
  const location = `${locationBase}/v1/fragments/${fragment.id}`;
  res.set('Location', location);
  logger.debug({ location }, 'Location header set for the fragment');

  // Respond with success
  return res.status(201).json(
    createSuccessResponse({
      fragment: {
        id: fragment.id,
        ownerId: fragment.ownerId,
        created: fragment.created,
        updated: fragment.updated,
        type: fragment.type,
        size: fragment.size,
      },
    })
  );
};

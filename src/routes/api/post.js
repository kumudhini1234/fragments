// const { createSuccessResponse } = require('../../response');
// const { createErrorResponse } = require('../../response');
// const { Fragment } = require('../../model/fragment');
// const logger = require('../../logger');

// module.exports = async (req, res) => {
//   // Early return if req.body is not a Buffer
//   if (!Buffer.isBuffer(req.body)) {
//     logger.warn('Content-Type is not supported for POST');
//     return res
//       .status(415)
//       .json(
//         createErrorResponse(
//           415,
//           'The Content-Type of the fragment being sent with the request is not supported'
//         )
//       );
//   }

//   // Proceed with the rest of the code if req.body is a Buffer
//   logger.info('v1/fragments POST route works');

//   // Get the headers from the request
//   const headers = req.headers;
//   // Access specific header properties
//   const contentType = headers['content-type'];

//   // Create a new fragment
//   let fragmentData = new Fragment({
//     ownerId: req.user,
//     type: contentType,
//     size: req.body.length,
//   });
//   logger.debug({ fragmentData }, 'A fragment is created');

//   const host = process.env.API_URL || req.headers.host;

//   // ADD Location header
//   res.location(host + `/v1/fragments/${fragmentData.id}`);

//   // Save fragment metadata
//   await fragmentData.save();
//   // Save fragment data
//   await fragmentData.setData(req.body);

//   // Respond with success
//   res.status(201).json(createSuccessResponse({ fragment: fragmentData }));
// };

// src/routes/api/post.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Create a new fragment for the current user
 */
module.exports = async (req, res) => {
  logger.info('Received a POST request to /fragments');

  const  type  = req.headers['content-type'];
  if (!Fragment.isSupportedType(type)) {
    logger.warn(`Unsupported Content-Type: ${type}`);
    return res.status(415).json(createErrorResponse(415, 'Unsupported Content-Type'));
  }

  const hashedEmail = req.user;
  const fragmentParameter = {
    ownerId: hashedEmail,
    type,
  };

  const fragment = new Fragment(fragmentParameter);
  try {
    // loggers are in Fragment class already
    await fragment.save();
    await fragment.setData(req.body);
  } catch (err) {
    if (err.message === 'Invalid data type: data must be a Buffer') {
      return res.status(400).json(createErrorResponse(400, 'Invalid data input.'));
    }
    logger.error({ message: err.message }, 'Error saving fragment during POST');
    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
  const locationBase = `http://${req.headers.host}`;
  const location = `${locationBase}/v1/fragments/${fragment.id}`;
  res.set('Location', location);
  logger.debug({ location }, 'Location header set for the fragment');

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
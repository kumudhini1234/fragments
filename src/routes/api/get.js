const { createSuccessResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {

      // Fetch the fragments for the authenticated user
      const fragments = await Fragment.byUser(req.user);
      logger.debug({ fragments }, 'Fetched fragments for user');
  
      // Log the response status code
      logger.info({ status: res.statusCode }, 'Response status code');
  
      // Respond with a placeholder array (empty for now)
     // res.status(200).json(createSuccessResponse({ fragments }));

  res.status(200).json(createSuccessResponse({ fragments: fragments }));
};

//src/routs/api/getById

const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const markdown = require('markdown-it')();
const yaml = require('js-yaml');

module.exports = async (req, res) => {
  try {
    const fragmentIdWithExt = req.params.id;
    const [fragmentId, requestedExt] = fragmentIdWithExt.split('.');

    logger.info(`Requested fragment ID: ${fragmentId}, Requested extension: ${requestedExt}`);

    // Attempt to retrieve the fragment by ID
    let fragment;
    try {
      fragment = await Fragment.byId(req.user, fragmentId);
      if (!fragment) {
        logger.warn(`Fragment with ID ${fragmentId} not found for user ${req.user}`);
        return res
          .status(404)
          .json(createErrorResponse(404, `Fragment with ID ${fragmentId} not found`));
      }
    } catch (error) {
      logger.error(`Error retrieving fragment: ${error.message}`);
      return res
        .status(404)
        .json(createErrorResponse(404, `Fragment with ID ${fragmentId} not found`));
    }

    // Retrieve fragment data
    const data = await fragment.getData();
    const originalType = fragment.mimeType;

    // If no extension is provided, return raw data
    if (!requestedExt) {
      res.setHeader('Content-Type', originalType);
      return res.status(200).send(data);
    }

    // Supported conversions
    const mimeTypeMap = {
      txt: 'text/plain',
      md: 'text/markdown',
      html: 'text/html',
      csv: 'text/csv',
      json: 'application/json',
      yaml: 'application/yaml',
      yml: 'application/yaml',
    };

    const targetType = mimeTypeMap[requestedExt];
    if (!targetType) {
      logger.warn(`Unsupported extension requested: ${requestedExt}`);
      return res
        .status(415)
        .json(createErrorResponse(415, `Unsupported extension: ${requestedExt}`));
    }

    // Perform conversion
    const convertedData = convertFragment(fragment, data, targetType);
    if (!convertedData) {
      logger.warn(`Conversion from ${originalType} to ${targetType} not supported`);
      return res
        .status(415)
        .json(createErrorResponse(415, `Conversion to ${requestedExt} is not supported`));
    }

    res.setHeader('Content-Type', targetType);
    return res.status(200).send(convertedData);
  } catch (error) {
    logger.error(`Internal Server Error: ${error.message}`);
    return res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};

// Helper function for fragment conversion
const convertFragment = (fragment, data, targetType) => {
  const originalType = fragment.mimeType;

  // Return raw data if types match
  if (targetType === originalType) return data;

  // Markdown to HTML or Plain Text
  if (originalType === 'text/markdown') {
    return targetType === 'text/html'
      ? markdown.render(data.toString('utf8'))
      : markdown.render(data.toString('utf8')).replace(/<[^>]*>/g, '');
  }

  // CSV to JSON
  if (originalType === 'text/csv' && targetType === 'application/json') {
    const csv = data.toString('utf8').split('\n');
    const headers = csv[0].split(',');
    const jsonData = csv.slice(1).map((row) => {
      const values = row.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
    return JSON.stringify(jsonData, null, 2);
  }

  // JSON to YAML or Plain Text
  if (originalType === 'application/json') {
    const parsedJSON = JSON.parse(data.toString('utf8'));
    return targetType === 'application/yaml'
      ? yaml.dump(parsedJSON)
      : JSON.stringify(parsedJSON, null, 2);
  }

  // YAML to JSON or Plain Text
  if (originalType === 'application/yaml') {
    const parsedYAML = yaml.load(data.toString('utf8'));
    return targetType === 'application/json'
      ? JSON.stringify(parsedYAML, null, 2)
      : yaml.dump(parsedYAML);
  }

  return null; // Unsupported conversion
};

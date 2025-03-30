// //src/model/fragment.js

const { randomUUID } = require('crypto');
const contentType = require('content-type');
const logger = require('../logger');

const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const validTypes = [
  'text/plain',
  'text/markdown',
  'text/html',
  'text/csv',
  'application/json',
  'application/yaml',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif',
];

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) {
      throw new Error('OwnerId and type must be defined');
    }
    if (typeof size !== 'number' || size < 0) {
      throw new Error('Size must be a positive number');
    }
    let arr = type.split(';');
    if (!validTypes.includes(arr[0].trim())) {
      throw new Error('type must be a supported type and got ' + arr[0].trim());
    }
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  static byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  static byId(ownerId, id) {
    if (!ownerId || !id) {
      return Promise.reject(new Error('OwnerId and id must be defined'));
    }
    return readFragment(ownerId, id).then((result) => {
      if (result === undefined) {
        return Promise.reject(new Error('Fragment not found'));
      }
      return new Fragment(result);
    });
  }

  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  async save() {
    try {
      this.updated = new Date().toISOString();

      await writeFragment(this);

      return Promise.resolve();
    } catch (err) {
      throw new Error(`error saving fragment to database: ${err.message}`);
    }
  }

  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  setData(data) {
    if (data === undefined) {
      return Promise.reject(new Error('data must be specified'));
    }
    this.size = Buffer.byteLength(data);
    this.updated = new Date().toISOString();
    return writeFragment(this).then(() => writeFragmentData(this.ownerId, this.id, data));
  }

  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  get isText() {
    const { type } = contentType.parse(this.type);
    return type.startsWith('text/');
  }

  get formats() {
    const validConversions = {
      'text/plain': ['text/plain'],
      'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
      'text/html': ['text/html', 'text/plain'],
      'text/csv': ['text/csv', 'text/plain', 'application/json'],
      'application/json': ['application/json', 'application/yaml', 'text/plain'],
      'application/yaml': ['application/yaml', 'text/plain'],
      'image/png': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/jpeg': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/webp': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/avif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/gif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
    };
    return validConversions[this.mimeType] || false;
  }

  static isSupportedType(value) {
    logger.debug(`isSupportedType with value: ${value}`);
    let arr = value.split(';');
    return validTypes.includes(arr[0].trim());
  }
}

module.exports.Fragment = Fragment;

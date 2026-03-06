const allowedFileTypes = {
  // Images
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/bmp': '.bmp',
  'image/tiff': '.tiff',

  // Videos
  'video/mp4': '.mp4',
  'video/mpeg': '.mpeg',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/x-msvideo': '.avi',
  'video/x-matroska': '.mkv',

  // Audio
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/flac': '.flac',
  'audio/aac': '.aac',

  // Documents
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'text/plain': '.txt',
  'text/csv': '.csv',

  // Archives
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar',
  'application/x-7z-compressed': '.7z',
  'application/gzip': '.gz',
  'application/x-tar': '.tar',

  // Other
  'application/json': '.json',
  'application/xml': '.xml',
};

module.exports = { allowedFileTypes };

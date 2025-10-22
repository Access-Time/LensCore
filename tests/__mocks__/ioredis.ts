// Mock Redis untuk test environment
const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  flushdb: jest.fn().mockResolvedValue('OK'),
  info: jest.fn().mockResolvedValue('redis_version:6.0.0'),
  disconnect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  off: jest.fn(),
};

const Redis = jest.fn().mockImplementation(() => mockRedis);

export default Redis;

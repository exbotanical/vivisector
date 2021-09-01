import { vivisect } from '../src';

beforeAll(() => {
  global.vivisect = vivisect;
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

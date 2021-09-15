import { vivisect } from '../lib';

beforeAll(() => {
	global.vivisect = vivisect;
});

beforeEach(() => {
	jest.useFakeTimers();
});

afterEach(() => {
	jest.clearAllMocks();
});

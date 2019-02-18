import { warnNoContextAvailable } from '../utils';

describe('utils', () => {
  describe('warnNoContextAvailable', () => {
    let warn: any;
    beforeEach(() => {
      warn = jest.spyOn(console, 'warn');
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('should warn for components', () => {
      warnNoContextAvailable('ViewportObserver');
      expect(warn).toHaveBeenCalled();
      expect(warn.mock.calls[0][0]).toContain(
        'react-viewport-utils: ViewportObserver component',
      );
    });

    it('should warn for hools', () => {
      warnNoContextAvailable('useViewport');
      expect(warn).toHaveBeenCalled();
      expect(warn.mock.calls[0][0]).toContain(
        'react-viewport-utils: useViewport hook',
      );
    });
  });
});

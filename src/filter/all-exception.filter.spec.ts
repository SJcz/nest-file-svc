import { AllExceptionFilter } from './all-exception.filter';

describe('ExceptionFilter', () => {
  it('should be defined', () => {
    expect(new AllExceptionFilter()).toBeDefined();
  });
});

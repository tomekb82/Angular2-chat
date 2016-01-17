
import {Calculator} from "../../../src/app/calculator/calculator";

describe('Hello', () => {

  it('should add', () => {
    let c = new Calculator();
    expect(true).toBe(true);
    expect(c.add(1,2)).toBe(3);
  });

});

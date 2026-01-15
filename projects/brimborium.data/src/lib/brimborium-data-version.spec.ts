import { addValueVersionChanged, BrimboriumDataVersion, BrimboriumValueVersion, setValueVersion } from './brimborium-data-version';

describe('BrimboriumDataVersion', () => {
  it('setting increases the version', () => {
    const sut = new BrimboriumDataVersion(1)
    expect(sut.value).toBe(1);
    expect(sut.version).toBe(0);

    sut.setValue(2)
    expect(sut.value).toBe(2);
    expect(sut.version).toBe(1);
  });

  it('setting the same value does not increases the version', () => {
    const sut = new BrimboriumDataVersion(1)
    expect(sut.value).toBe(1);
    expect(sut.version).toBe(0);

    sut.setValue(2)
    expect(sut.value).toBe(2);
    expect(sut.version).toBe(1);

    sut.setValue(2)
    expect(sut.value).toBe(2);
    expect(sut.version).toBe(1);
  });

  it('dep', () => {
    const a = new BrimboriumDataVersion(1);
    const b = new BrimboriumDataVersion(1);
    const c = new BrimboriumDataVersion(1);
    c.setImmediateCalculation({
      a: a,
      b: b
    }, ({ a, b }, that) => {
      that.setValue(a.value + b.value);
    });

    a.setValue(2);

    expect(c.value).toBe(3);
    expect(c.getValue()).toBe(3);

  });
  
  it('dep lazy', () => {
    const a = new BrimboriumDataVersion(1);
    const b = new BrimboriumDataVersion(1);
    const c = new BrimboriumDataVersion(1);
    const d = { changes: 0 };
    c.setLazyCalculation({
      a: a,
      b: b
    }, ({ a, b }, that) => {
      d.changes++;
      that.setValue(a.value + b.value);
    });

    expect(a.version).toBe(0);
    expect(d.changes).toBe(0);
    a.setValue(2);
    expect(a.version).toBe(1);
    expect(d.changes).toBe(0);
    
    expect(c.value).toBe(1);
    expect(c.getValue()).toBe(3);
    expect(d.changes).toBe(1);
  });

  it('addChanged', () => {
    const a = new BrimboriumDataVersion(1);
    const b = { changed: 0 };
    a.addChanged(() => { b.changed++ })
    a.setValue(1);
    a.setValue(2);
    a.setValue(2);
    expect(b.changed).toBe(1);
  });

  it('accessor', () => {
    const a = new BrimboriumDataVersion(1);
    const accessor = a.accessor();
    expect(accessor().value).toBe(1);

    a.setValue(2)
    expect(accessor().value).toBe(2);

    const accessor2 = a.accessor();
    expect(Object.is(accessor, accessor2)).toBe(true);
    expect(accessor === accessor2).toBe(true);
  });
});

describe('BrimboriumValueVersion', () => {
  it('setting increases the version', () => {
    const sut: BrimboriumValueVersion<number> = {
      value: 1
    };

    expect(setValueVersion(sut, 2)).toBe(true);
    expect(sut.version).toBe(1);

    expect(setValueVersion(sut, 2)).toBe(false);
  });


  it('listDistributeDirty', () => {
    const a: BrimboriumValueVersion<number> = {
      value: 1
    };
    const b: BrimboriumValueVersion<number> = {
      value: 1
    };
    addValueVersionChanged(a, () => {
      setValueVersion(b, a.value + 1);
    })
  });
});

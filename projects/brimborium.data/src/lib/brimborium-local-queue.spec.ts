import { BrimboriumLocalQueue } from './brimborium-local-queue';

describe('BrimboriumLocalQueue', () => {
  it('add process immediately', () => {
    const sideEffect={cnt:0};
    const sut=new BrimboriumLocalQueue<number>(
      (i)=>{sideEffect.cnt++;},
      (i)=>(0<i)
    )
    sut.add(1);
    expect(sideEffect.cnt).toBe(1);

    sut.add(-1);
    expect(sideEffect.cnt).toBe(1);
  });

  it('add process suspended', () => {
    const sideEffect={cnt:0};
    const sut=new BrimboriumLocalQueue<number>(
      (i)=>{sideEffect.cnt++;},
      (i)=>(0<i)
    )
    sut.suspend()
    sut.add(1);
    expect(sideEffect.cnt).toBe(0);

    sut.add(-1);
    expect(sideEffect.cnt).toBe(0);

    sut.resume();
    expect(sideEffect.cnt).toBe(1);
  });
});

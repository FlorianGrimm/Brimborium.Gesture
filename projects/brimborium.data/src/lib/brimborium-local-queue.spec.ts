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
    const lock = sut.suspend();
    try{
      sut.add(1);
      expect(sideEffect.cnt).toBe(0);
      
      sut.add(-1);
      expect(sideEffect.cnt).toBe(0);
      
    } finally{
      sut.resume(lock);
    }
    expect(sideEffect.cnt).toBe(1);
  });
});

import {
  Component,
  signal
} from '@angular/core';
import {
  BrimboriumGestureRoot,
  BrimboriumGestureManager,
  BrimboriumGestureHandle,
  BrimboriumGestureList,
  BrimboriumGesture,
} from 'Brimborium.Gesture'

@Component({
  selector: 'app-page2',
  imports: [
    BrimboriumGestureRoot,
    BrimboriumGestureHandle,
    BrimboriumGestureList,
    BrimboriumGesture,
  ],
  templateUrl: './page2.html',
  styleUrl: './page2.scss',
})
export class Page2 {
  //onContextMenu($event: PointerEvent) {}
  readonly $listDataOne = signal<Page2Data[]>(getInitialListDataOne(), { debugName: '$listDataOne' });
  readonly $listDataTwo = signal<Page2Data[]>(getInitialListDataOne(), { debugName: '$listDataTwo' });
}

export type Boundery = {
  top: number;
  left: number;
  width: number;
  height: number;
}
export type Page2Data = {
  id: string;
  boundery: Boundery;
  color: string;
  text: string;
};

function getInitialListDataOne(): Page2Data[] {
  return [
    {
      id: "data1",
      boundery: { top: 100, left: 100, width: 100, height: 100 },
      color:"#00ff00",
      text: "Data 1"
    },
    {
      id: "data2",
      boundery: { top: 300, left: 100, width: 100, height: 100 },
      color:"#ffff00",
      text: "Data 2"
    },
    {
      id: "data3",
      boundery: { top: 300, left: 300, width: 100, height: 100 },
      color:"#00ffff",
      text: "Data 3"
    }
  ];
}

function getInitialListDataTwo(): Page2Data[] {
  return [
    {
      id: "data4",
      boundery: { top: 100, left: 100, width: 100, height: 100 },
      color:"#00e000",
      text: "Data 4"
    },
    {
      id: "data5",
      boundery: { top: 300, left: 100, width: 100, height: 100 },
      color:"#e0e000",
      text: "Data 5"
    },
    {
      id: "data6",
      boundery: { top: 300, left: 300, width: 100, height: 100 },
      color:"#00e0e0",
      text: "Data 6"
    }
  ];
}

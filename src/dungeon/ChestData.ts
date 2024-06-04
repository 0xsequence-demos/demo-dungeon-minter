import { Signal } from "./Signal";

export class ChestData {
  opened = false;
  looted = false;
  constructor(
    public x: number,
    public y: number,
    public direction: number,
    public color: string,
    public id: number,
  ) {
    //
  }
  approachSignal = new Signal<ChestData>();
  openSignal = new Signal<ChestData>();
  lootSignal = new Signal<ChestData>();
  abandonSignal = new Signal<ChestData>();
  approach() {
    this.approachSignal.emit(this);
  }
  open() {
    this.opened = true;
    this.openSignal.emit(this);
  }
  loot() {
    this.looted = true;
    this.lootSignal.emit(this);
  }
  abandon() {
    this.abandonSignal.emit(this);
  }
}

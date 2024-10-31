export class Signal<T> {
  listeners: ((value: T) => void)[] = [];
  listen(listener: (value: T) => void) {
    this.listeners.push(listener);
  }

  stopListening(listener: (value: T) => void) {
    const i = this.listeners.indexOf(listener);
    if (i !== -1) {
      this.listeners.splice(i, 1);
    }
    const i2 = this.oneTimeListeners.indexOf(listener);
    if (i2 !== -1) {
      this.oneTimeListeners.splice(i2, 1);
    }
  }

  oneTimeListeners: ((value: T) => void)[] = [];
  listenOnce(listener: (value: T) => void) {
    this.oneTimeListeners.push(listener);
  }

  emit(value: T) {
    for (const listener of this.listeners) {
      listener(value);
    }
    for (const listener of this.oneTimeListeners) {
      listener(value);
    }
    this.oneTimeListeners.length = 0;
  }
}

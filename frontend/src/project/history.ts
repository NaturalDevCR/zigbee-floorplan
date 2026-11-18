/** Snapshot-based undo/redo over immutable values. */
export class History<T> {
  private past: T[] = [];
  private future: T[] = [];

  constructor(
    private current: T,
    private readonly limit = 200,
  ) {}

  get present(): T {
    return this.current;
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  push(next: T): void {
    if (next === this.current) return;
    this.past.push(this.current);
    if (this.past.length > this.limit) this.past.shift();
    this.current = next;
    this.future = [];
  }

  undo(): T {
    const prev = this.past.pop();
    if (prev !== undefined) {
      this.future.push(this.current);
      this.current = prev;
    }
    return this.current;
  }

  redo(): T {
    const next = this.future.pop();
    if (next !== undefined) {
      this.past.push(this.current);
      this.current = next;
    }
    return this.current;
  }

  reset(value: T): void {
    this.current = value;
    this.past = [];
    this.future = [];
  }
}

//親から、始まりの時間と終わりの時間と来校が可能かどうかの２つ引数として受け取る
type Slot = {
  start_at: string;
  end_at: string;
  available: boolean;
};

export function maxConsecutiveInDay(slots: Slot[]) {
  let current = 0;
  let max = 0;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const prev = slots[i - 1];
    if (!slot.available) {
      current = 0;
    } else if (prev && prev.end_at === slot.start_at) {
      current = current + 1;
    } else {
      current = 1;
    }
    if (max < current) {
      max = current;
    }
  }
  return max;
}

import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function setup(reduced = false) {
  const html = readFileSync('public/index.html', 'utf8');
  const start = html.indexOf('const sheetStates=');
  const end = html.indexOf('const sourceDefs=', start);
  const frames = new Map();
  let frameId = 0, now = 100;
  const preference = {matches: reduced};
  const context = vm.createContext({
    matchMedia: () => preference,
    requestAnimationFrame: fn => {frames.set(++frameId, fn); return frameId;},
    cancelAnimationFrame: id => frames.delete(id),
  });
  vm.runInContext(html.slice(start, end) + '\nglobalThis.motion = {showSheet, closeSheet};', context);
  const dialog = {open: false, style: {}, closes: 0, showModal() {this.open = true;}, close() {this.open = false; this.closes++;}};
  function tick(count = 1) {
    for (let i = 0; i < count; i++) {
      now += 16.67;
      const pending = [...frames.values()]; frames.clear();
      for (const callback of pending) callback(now);
    }
  }
  return {motion: context.motion, dialog, frames, preference, tick};
}

test('sheet opens and closes along the same path, releasing the native modal', () => {
  const {motion, dialog, frames, tick} = setup();
  motion.showSheet(dialog); assert.equal(dialog.open, true);
  tick(90); assert.equal(frames.size, 0); assert.equal(dialog.style.transform, '');
  motion.closeSheet(dialog); tick(90);
  assert.equal(dialog.open, false); assert.equal(dialog.closes, 1); assert.equal(frames.size, 0);
});

test('sheet close can be interrupted and reopened without jumping or locking input', () => {
  const {motion, dialog, frames, tick} = setup();
  motion.showSheet(dialog); tick(90);
  motion.closeSheet(dialog); tick(5);
  const before = Number(dialog.style.opacity);
  assert.ok(before > 0 && before < 1);
  motion.showSheet(dialog);
  assert.equal(Number(dialog.style.opacity), before);
  assert.equal(frames.size, 1);
  tick(90);
  assert.equal(dialog.open, true); assert.equal(dialog.closes, 0); assert.equal(frames.size, 0);
});

test('reduced motion cancels a pending spring and dismisses immediately', () => {
  const {motion, dialog, frames, preference, tick} = setup();
  motion.showSheet(dialog); tick(3);
  preference.matches = true; motion.closeSheet(dialog);
  assert.equal(frames.size, 0); assert.equal(dialog.open, false); assert.equal(dialog.style.transform, '');
  motion.showSheet(dialog);
  assert.equal(dialog.open, true); assert.equal(frames.size, 0);
});

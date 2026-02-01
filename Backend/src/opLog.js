import { v4 as uuid } from "uuid";

const opLog = [];
const activeOps = [];
const undoStack = [];
const redoStack = [];

export function onStrokeCommit(op, io) {
  opLog.push(op);
  activeOps.push(op.opId);
  undoStack.push(op.opId);
  redoStack.length = 0;

  io.emit("canvas:update", getActiveSnapshot());
}

export function onUndo(io) {
  if (!undoStack.length) return;

  const id = undoStack.pop();
  redoStack.push(id);

  const idx = activeOps.indexOf(id);
  if (idx !== -1) activeOps.splice(idx, 1);

  io.emit("canvas:update", getActiveSnapshot());
}

export function onRedo(io) {
  if (!redoStack.length) return;

  const id = redoStack.pop();
  undoStack.push(id);
  activeOps.push(id);

  io.emit("canvas:update", getActiveSnapshot());
}

export function getActiveSnapshot() {
  return activeOps.map(id => opLog.find(o => o.opId === id));
}

export function getSnapshot() {
  return getActiveSnapshot();
}

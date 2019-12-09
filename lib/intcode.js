const { range, update } = require("./util");

const CMD_SUM = 1;
const CMD_MUL = 2;
const CMD_INPUT = 3;
const CMD_OUTPUT = 4;
const CMD_JUMP_IF_TRUE = 5;
const CMD_JUMP_IF_FALSE = 6;
const CMD_IF_LESS = 7;
const CMD_IF_EQUAL = 8;
const CMD_CHANGE_BASE = 9;
const CMD_TERMINATE = 99;

const MODE_POINTER = 0;
const MODE_IMMEDIATE = 1;
const MODE_RELATIVE = 2;

const getArgs = ({ mem, pointer, count, base, modes }) => {
  const pArgs = mem
    .slice(pointer + 1, pointer + count + 1)
    .map((pArg, i) => pArg + (modes[i] & MODE_RELATIVE ? base : 0));
  const args = [];
  for (const i of range(0, count)) {
    switch (modes[i] & MODE_IMMEDIATE) {
      case MODE_POINTER:
        args.push(mem[pArgs[i]] || 0);
        break;
      case MODE_IMMEDIATE:
        args.push(pArgs[i] || 0);
        break;
    }
  }
  return args;
};

const getCommandCode = opcode => opcode % 100;

const getModes = opcode => [
  ((opcode / 100) | 0) % 10,
  ((opcode / 1000) | 0) % 10,
  ((opcode / 10000) | 0) % 10
];

const commands = {
  [CMD_SUM]: async (mem, pointer, base, modes) => {
    const [val1, val2, pResult] = getArgs({
      mem,
      pointer,
      count: 3,
      base,
      modes: [modes[0], modes[1], modes[2] | MODE_IMMEDIATE]
    });
    return [update(mem, pResult, val1 + val2), pointer + 4, base];
  },
  [CMD_MUL]: async (mem, pointer, base, modes) => {
    const [val1, val2, pResult] = getArgs({
      mem,
      pointer,
      count: 3,
      base,
      modes: [modes[0], modes[1], modes[2] | MODE_IMMEDIATE]
    });
    return [update(mem, pResult, val1 * val2), pointer + 4, base];
  },
  [CMD_INPUT]: async (mem, pointer, base, modes, input) => {
    const [pResult] = getArgs({
      mem,
      pointer,
      count: 1,
      base,
      modes: [modes[0] | MODE_IMMEDIATE]
    });
    const inputValue = await input();
    return [update(mem, pResult, inputValue), pointer + 2, base];
  },
  [CMD_OUTPUT]: async (mem, pointer, base, modes, _, output) => {
    const [val] = getArgs({ mem, pointer, count: 1, base, modes });
    await output(val);
    return [mem, pointer + 2, base];
  },
  [CMD_JUMP_IF_TRUE]: async (mem, pointer, base, modes) => {
    const [checkVal, nextPointer] = getArgs({
      mem,
      pointer,
      count: 2,
      base,
      modes
    });
    return [mem, checkVal ? nextPointer : pointer + 3, base];
  },
  [CMD_JUMP_IF_FALSE]: async (mem, pointer, base, modes) => {
    const [checkVal, nextPointer] = getArgs({
      mem,
      pointer,
      count: 2,
      base,
      modes
    });
    return [mem, !checkVal ? nextPointer : pointer + 3, base];
  },
  [CMD_IF_LESS]: async (mem, pointer, base, modes) => {
    const [val1, val2, pResult] = getArgs({
      mem,
      pointer,
      count: 3,
      base,
      modes: [modes[0], modes[1], modes[2] | MODE_IMMEDIATE]
    });
    return [update(mem, pResult, val1 < val2 ? 1 : 0), pointer + 4, base];
  },
  [CMD_IF_EQUAL]: async (mem, pointer, base, modes) => {
    const [val1, val2, pResult] = getArgs({
      mem,
      pointer,
      count: 3,
      base,
      modes: [modes[0], modes[1], modes[2] | MODE_IMMEDIATE]
    });
    return [update(mem, pResult, val1 === val2 ? 1 : 0), pointer + 4, base];
  },
  [CMD_CHANGE_BASE]: async (mem, pointer, base, modes) => {
    const [val] = getArgs({ mem, pointer, count: 1, base, modes });
    return [mem, pointer + 2, base + val];
  }
};

exports.runCode = async (opcodes, input, output) => {
  let mem = [...opcodes];
  let pointer = 0;
  let base = 0;

  while (mem[pointer] !== CMD_TERMINATE) {
    const opcode = mem[pointer];
    const commandCode = getCommandCode(opcode);
    const modes = getModes(opcode);
    const cmdFn = commands[commandCode];
    if (!cmdFn) {
      return -1;
    }
    [mem, pointer, base] = await cmdFn(
      mem,
      pointer,
      base,
      modes,
      input,
      output
    );
  }
  return mem[0];
};
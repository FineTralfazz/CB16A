# CB16A
This is a technically-finished 16-bit CPU instruction set and emulator, written for a CS301 project. I didn't have as much time to work on it as I wanted, so as a result it's not as polished or feature-complete as I planned, but it does work.

## Instructions
- `nop nop`: Does nothing
- `mov dst, src`: Copies data from one register to another
- `add dst, src`: Adds two registers
- `sub dst, src`: Subtracts `dst` register from `src` register
- `push src`: Pushes `src` onto the stack
- `pop dst`: Pops the value on top of the stack into `dst`
- `jmp dst`: Sets the instruction pointer to the literal address `dst`
- `cmp arg0, arg1`: Compares `arg0` and `arg1`
- `je dst`: Jumps to literal value `dst` if `arg0` and `arg1` were equal
- `jg dst`: Jumps if `arg0` > `arg1`
- `jge dst`: Jumps if `arg0` >= `arg1` 
- `jl dst`: Jumps if `arg0` < `arg1`
- `jle dst`: Jumps if `arg0` <= `arg1`
- `jne dst`: Jumps if `arg0` != `arg1`
- `set dst, value`: Sets register `dst` to literal `value`
- `save dst, src`: Saves register `src` to memory at literal `dst`
- `load dst, src`: Loads memory at literal `src` into register `dst`
- `out src`: Passes the integer at register `src` to the output function
- `mul dst, src`: Multiplies `src` and `dst` registers

## Improvements for CB16B
- Parse and map labels
- Let `out` print non-integers
- `ret` instruction

class CB16A {
	constructor() {
		this.ascii_bin_mapping = {
			//// Registers
			// 8 generics
			"r0": 0x0,
			"r1": 0x1,
			"r2": 0x2,
			"r3": 0x3,
			"r4": 0x4,
			"r5": 0x5,
			"r6": 0x6,
			"r7": 0x7,
			// 0x8-c are reserved for future use
			"cr": 0xd, // Comparison result
			"sp": 0xe, // Stack pointer
			"ip": 0xf, // Instruction pointer

			//// Instructions
			"nop": 0x10,
			"mov": 0x11,
			"add": 0x12,
			"sub": 0x13,
			"push": 0x14,
			"pop": 0x15,
			"jmp": 0x16
		}

		this.memory = new Uint8Array(65536) // 2^16
		this.registers = new Uint16Array(16) // 2^4
	}


	reset() {
		this.memory.fill(0)
		// Should also reload the code, instead of just clearing the memory
	}


	assemble(code) {
		// This is kind of gross, but was the simplest way I could think of
		// to implement the basic syntax
		var lines = code.split(/\n/)
		var address = 0
		var labels = {}
		var unresolved_labels = []
		var _this = this

		lines.forEach(function(line) {
			// Normalize and remove comments
			console.log(`Assembling ${line}`)
			line = line.split(';')[0]
			line = line.trim()

			if (line[line.length-1] == ':') {
				// Handle labels
				var label = line.slice(0, -1)
				labels[label] = address
			} else {
				// Normal instructions
				var instruction = line.split(/\s+/)[0].trim()
				var destination = line.split(',')[0].split(/\s+/)[1].trim()
				var source = line.split(',')[1].trim()
				_this._convert_and_write(instruction, address++)
				_this._convert_and_write(destination, address++)
				_this._convert_and_write(source, address++)
			}
		})
	}


	_convert_and_write(value, address) {
		// Converts source code representations of instructions/registers/etc.
		// to binary and writes them to the specified address
		this.memory[address] = this.ascii_bin_mapping[value]
	}
}

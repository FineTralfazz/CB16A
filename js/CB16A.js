class CB16A {
	constructor() {
		this.register_mapping = {
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
			"ip": 0xf // Instruction pointer
		}

		this.instruction_mapping = {
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
		var offset = 0
		
		lines.forEach(function(line) {
			// Normalize and remove comments
			line = line.split(';')[0]
			line = line.trim()

			if (line[line.length-1] == ':') {
				// Handle labels
			} else {
				// Normal instructions
				var instruction = line.split(/\S/)[0].trim()
				var destination = line.split(/\S/, 1)[1].split(',')[0].trim()
				var source = line.split(',')[1].trim()
			}
		})
	}
}

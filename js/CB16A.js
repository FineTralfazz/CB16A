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
		this.registers[0xe] = 32768 // Stack is the last 2^15 bytes
	}


	reset() {
		this.memory.fill(0)
		this.registers.fill(0)
		if (this.initial_state) {
			this.memory = this.initial_state
		}
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
		this.initial_state = this.memory
		return this.memory
	}


	tick() {
		var instruction = this._read_ip()
		switch (instruction) {
			case 0x10: // nop
				break
			
			case 0x11: // mov
				var destination = this._read_ip()
				var source = this._read_ip()
				this._write_byte(destination, this._read_byte(source))
				break

			case 0x12: // add
				var destination = this._read_ip()
				var source = this._read_ip()
				var value = this._read_byte[source] + this._read_byte[destination]
				this._write_byte(destination, value)
				break

			case 0x13: // sub
				var destination = this._read_ip()
				var source = this._read_ip()
				var value = this._read_byte(destination) - this._read_byte(source)
				this._write_byte(destination, value)
				break

			case 0x14: // push
				var destination = ++this.registers[0xf]
				var byte = this._read_byte(this._read_ip())
				this._write_byte(destination, source)
				break

			case 0x15: // pop
				var destination = this._read_ip()
				var byte = this._read_byte(0xf)
				this.registers[0xf]--
				this._write_byte(destination, byte)
				break

			case 0x16: // jmp
				this.registers[0xe] = this._read_ip()
				break

			default:
				console.error(`Invalid instruction ${instruction} at ${this.registers[0xf]-1}`)
				break
		}
	}


	_convert_and_write(value, address) {
		// Converts source code representations of instructions/registers/etc.
		// to binary and writes them to the specified address
		if (!isNaN(value)) {
			// If it's a number, we can just write it.
			// The + converts strings to numbers, because... JS
			this.memory[address] = +value
		} else {
			// Do something with strings
			this.memory[address] = this.ascii_bin_mapping[value]
		}
	}


	_read_ip() {
		var byte = this.memory[this.registers[0xf]]
		this.registers[0xf]++
		return byte
	}


	_read_byte(location) {
		// Hacky workaround to tell the difference between registers and memory.
		// I need to figure out how real CPUs do it and use that instead...
		if (location <= 0xf) {
			return this.registers[location]
		} else {
			return this.memory[location]
		}
	}
	
	
	_write_byte(location, value) {
		// Hacky workaround -- see comment on _read_byte()
		if (location <= 0xf) {
			this.registers[location] = value
		} else {
			this.memory[location] = value
		}
	}
}

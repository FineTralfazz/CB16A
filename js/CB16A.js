class CB16A {
	constructor(write_out) {
		// function to output characters
		this._write_out = write_out

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
			"jmp": 0x16,
			"cmp": 0x17,
			"je": 0x18,
			"jg": 0x19,
			"jge": 0x1a,
			"jl": 0x1b,
			"jle": 0x1c,
			"jne": 0x1d,
			"set": 0x1e,
			"save": 0x1f,
			"load": 0x20,
			"out": 0x21,
			"mul": 0x22
		}

		// Comparison flags
		this._CMP_LESS = 1
		this._CMP_EQUAL = 2
		this._CMP_GREATER = 4

		// Initialize state
		this.memory = new Uint8Array(65536) // 2^16
		this.registers = new Uint16Array(16) // 2^4
		this.registers[0xe] = 32768 // Stack is the last 2^15 bytes
	}


	reset() {
		this.memory.fill(0)
		this.registers.fill(0)
		if (this.initial_state) {
			this.memory = this.initial_state.slice()
		}
		this.registers[0xe] = 32768
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
				var destination
				var source
				if (line.indexOf(',') != -1) {
					destination = line.split(',')[0].split(/\s+/)[1].trim()
					source = line.split(',')[1].trim()
				} else {
					destination = line.split(/\s+/)[1].trim()
				}
				
				// Map resolve, if necessary
				instruction = _this._map_resolve(instruction)
				destination = _this._map_resolve(destination)
				if (source) source = _this._map_resolve(source)

				// Write
				_this._write_mem_byte(instruction, address)
				address++
				_this._write_mem_word(destination, address)
				address += 2
				if (source != undefined) {
					_this._write_mem_word(source, address)
					address += 2
				}
			}
		})
		this.initial_state = this.memory.slice()
		return this.memory
	}



	tick() {
		var instruction = this._read_ip_byte()
		switch (instruction) {
			case 0x10: // nop
				break
			
			case 0x11: // mov
				var destination = this._read_ip_word()
				var source = this._read_ip_word()
				this.registers[destination] = this.registers[source]
				break

			case 0x12: // add
				var destination = this._read_ip_word()
				var source = this._read_ip_word()
				var value = this.registers[source] + this.registers[destination]
				this.registers[destination] = value
				break

			case 0x13: // sub
				var destination = this._read_ip_word()
				var source = this._read_ip_word()
				var value = this.registers[destination] - this.registers[source]
				this.registers[destination] = value
				break

			case 0x14: // push
				var value = this.registers[this._read_ip_word()]
				this.registers[0xe] += 2
				var destination = this.registers[0xe]
				this._write_mem_word(value, destination)
				break

			case 0x15: // pop
				var destination = this._read_ip_word()
				var value = this._read_mem_word(this.registers[0xe])
				this.registers[0xe] -= 2
				this.registers[destination] = value
				break

			case 0x16: // jmp
				this.registers[0xf] = this._read_ip_word()
				break

			case 0x17: // cmp
				var arg1 = this.registers[this._read_ip_word()];
				var arg2 = this.registers[this._read_ip_word()];
				var result = 0

				if (arg1 < arg2) result |= this._CMP_LESS
				if (arg1 == arg2) result |= this._CMP_EQUAL
				if (arg1 > arg2) result |= this._CMP_GREATER

				this.registers[0xd] = result
				break

			case 0x18: // je
				var destination = this._read_ip_word()
				if (this.registers[0xd] & this._CMP_EQUAL) {
					this.registers[0xf] = destination
				}
				break

			case 0x19: // jg
				var destination = this._read_ip_word()
				if (this.registers[0xd] & this._CMP_GREATER) {
					this.registers[0xf] = destination
				}
				break

			case 0x1a: // jge
				var destination = this._read_ip_word()
				if (this.registers[0xd] & (this._CMP_GREATER | this._CMP_EQUAL)) {
					this.registers[0xf] = destination
				}
				break

			case 0x1b: // jl
				var destination = this._read_ip_word()
				if (this.registers[0xd] & this._CMP_LESS) {
					this.registers[0xf] = destination
				}
				break

			case 0x1c: // jle
				var destination = this._read_ip_word()
				if (this.registers[0xd] & (this._CMP_LESS | this._CMP_EQUAL)) {
					this.registers[0xf] = destination
				}
				break

			case 0x1d: // jne
				var destination = this._read_ip_word()
				if (!this.registers[0xd] & this._CMP_EQUAL) {
					this.registers[0xf] = destination
				}
				break

			case 0x1e: // set
				var destination = this._read_ip_word()
				var value = this._read_ip_word()
				this.registers[destination] = value
				break

			case 0x1f: // save
				var destination = this._read_ip_word()
				var value = this.registers[this._read_ip_word()]
				this._write_mem_word(value, destination)
				break

			case 0x20: // load
				var destination = this._read_ip_word()
				var source = this._read_ip_word()
				this.registers[destination] = this._read_mem_word(source)
				break

			case 0x21: // out
				var source = this._read_ip_word()
				this._write_out(this.registers[source])
				this._write_out('\n')
				break

			case 0x22: //mul
				var destination = this._read_ip_word()
				var source = this._read_ip_word()
				this.registers[destination] *= this.registers[source]
				break

			default:
				console.error(`Invalid instruction ${instruction} at ${this.registers[0xf]-1}`)
				break
		}
	}


	_map_resolve(value) {
		// Converts source code representations of instructions/registers/etc.
		// to binary, if necessary
		if (isNaN(value)) {
			return this.ascii_bin_mapping[value]
		} else {
			return +value
		}
	}


	_read_ip_byte() {
		var byte = this.memory[this.registers[0xf]]
		this.registers[0xf]++
		return byte
	}


	_read_ip_word() {
		var word = this.memory[this.registers[0xf]]
		word = word << 8
		this.registers[0xf]++
		word = word + this.memory[this.registers[0xf]]
		this.registers[0xf]++
		return word
	}


	_read_mem_byte(address) {
		return this.memory[address]
	}
	
	
	_write_mem_byte(value, address) {
		this.memory[address] = value
	}
	

	_read_mem_word(address) {
		var word = this.memory[address]
		word = word << 8 // Did you know that JS has a bitshift operation? Because I didn't.
		return word + this.memory[address+1]
	}


	_write_mem_word(data, address) {
		this.memory[address] = data >> 8
		this.memory[address+1] = data - ((data >> 8) << 8)
	}
}

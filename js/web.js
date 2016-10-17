cpu = new CB16A(writeout)

function writeout(text) {
	var output = $("#output")
	output.text(output.text() + text)
}


function assemble() {
	cpu.assemble($("#code").val())
	show_registers()
}


function show_registers() {
	cpu.registers.forEach(function(value, index) {
		$(`#reg${index}`).text(value)
	})
}


function tick() {
	cpu.tick()
	show_registers()
}

cpu = new CB16A(writeout)

function writeout(text) {
	var output = $("#output")
	output.text(output.text() + text)
}


function assemble() {
	cpu.assemble($("#code").val())
}

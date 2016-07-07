
sources := $(shell find ${sourcesdir} -name *.js)
objects := $(addprefix ${builddir}/, ${sources})
objectdirs := $(addsuffix .dir, $(dir ${objects}))

all: $(standalone)

re: clean all

clean:
	@rm -rf ${builddir} ${standalone}

${standalone}: ${objectdirs} ${objects}
	@mkdir -p $(dir $@)
	@${browserify} ${builddir}/${main} -o ${standalone}

%.dir:
	@mkdir -p $(dir $@)
	@touch $@

${builddir}/%.js: %.js
	@mkdir -p $(dir %@)
	@${babel} --presets ${presets} $< > $@


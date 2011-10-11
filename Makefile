PROJECT_NAME = 'hupper'

# Variables to generate version string
DATESTR = $(shell date '+%g%m%d%H%M%S')
GIT_BRANCH = $(shell git branch | awk '/\*/ {print $$2}')
GIT_SHA = $(shell git log --pretty=%h -n 1)
VERSION = 1.4-$(DATESTR)-$(GIT_BRANCH).$(GIT_SHA)

REPLACE_VERSION_STRING = ___VERSION___
REPLACE_VERSION_FILES = install.rdf

all: clean setversion xpi restore

clean:
	@echo Clean
	@-rm $(PROJECT_NAME)*.xpi

setversion:
	@echo Set version to $(VERSION)
	@for file in $(REPLACE_VERSION_FILES); do \
		cp $${file} $${file}.orig; \
		sed "s/$(REPLACE_VERSION_STRING)/$(VERSION)/g" $${file} > $${file}.tmp; \
		mv $${file}.tmp $${file}; \
	done

xpi:
	@echo Compress files
	@zip -r -q -MM $(PROJECT_NAME)_$(VERSION).xpi \
		chrome.manifest \
		install.rdf \
		defaults/preferences/hupper.js \
    modules/hupdb.jsm \
    modules/styleLoader.jsm \
    modules/hupjumper.jsm \
    modules/hupstringer.jsm \
    modules/statusclickhandler.jsm \
    modules/timer.jsm \
    modules/TreeView.jsm \
    modules/HupEvent.jsm \
    modules/trollHandler.jsm \
    modules/hup-events.jsm \
    modules/prefs.jsm \
		chrome/ \
		license.txt;

restore:
	@echo Restore orignal files
	@for file in $(REPLACE_VERSION_FILES); do mv $${file}.orig $${file}; done

.PHONY: clean setversion restore

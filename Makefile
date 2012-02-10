PROJECT_NAME = 'hupper'

# Variables to generate version string
DATESTR = $(shell date '+%g%m%d%H%M%S')
GIT_BRANCH = $(shell git branch | awk '/\*/ {print $$2}')
GIT_SHA = $(shell git log --pretty=%h -n 1)
VERSION = 1.2-$(DATESTR)-$(GIT_BRANCH).$(GIT_SHA)

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
    modules/Bench.jsm \
    modules/TreeView.jsm \
    modules/HupEvent.jsm \
    modules/trollHandler.jsm \
    modules/hup-events.jsm \
    modules/prefs.jsm \
    modules/bundles.jsm \
    modules/Elementer.jsm \
    modules/log.jsm \
		modules/transform.jsm \
		chrome/skin/ \
		chrome/locale/ \
		chrome/content/hupper/namespace.js \
		chrome/content/hupper/ajax.js \
		chrome/content/hupper/postinstall.js \
		chrome/content/hupper/json.js \
		chrome/content/hupper/hup-elementer.js \
		chrome/content/hupper/menu.js \
		chrome/content/hupper/hupcomment.js \
		chrome/content/hupper/hupnode.js \
		chrome/content/hupper/hupblocks.js \
		chrome/content/hupper/hupblock.js \
		chrome/content/hupper/styles.js \
		chrome/content/hupper/nodeheadbuilder.js \
		chrome/content/hupper/boot.js \
		chrome/content/hupper/hupper.js \
		chrome/content/hupper/hupper-prefs.js \
		chrome/content/hupper/hupper.xul \
		chrome/content/hupper/hupper-prefs.xul \
		license.txt;

restore:
	@echo Restore orignal files
	@for file in $(REPLACE_VERSION_FILES); do mv $${file}.orig $${file}; done

.PHONY: clean setversion restore

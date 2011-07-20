SRC_DIR = src
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

JS_FILES = license.txt\
	${SRC_DIR}/jquery.dialog.js

JS = ${DIST_DIR}/jquery.dialog.js
JS_MIN = ${DIST_DIR}/jquery.dialog.min.js
JS_PACK = ${DIST_DIR}/jquery.dialog.pack.js

JS_ENGINE ?= `which node nodejs`
COMPILER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --unsafe
MINIFIER = java -Xmx96m -jar ${BUILD_DIR}/yuicompressor.jar
PACKER = java -jar ${BUILD_DIR}/rhino.jar ${BUILD_DIR}/packer.js
JSDOC = /c/devl/js/tools/jsdoc-toolkit-2.4.0
ANT_HOME = /c/devl/java/tools/apache-ant-1.7.0/bin/ant
JGROUSE_DOC = /c/devl/js/tools/jGrouseDoc-2.1


VERSION = `cat version.txt`
DATE = `git log --pretty=format:'%ad' -1`

all: clean js css hint min pack doc
	@@echo "done"

doc: 
	@@echo "Creating documentation using jsdoc-toolkit...."
#	java -Djsdoc=${JSDOC} -jar ${JSDOC}/jsrun.jar ${JSDOC}/app/run.js -t=${JSDOC}/templates/jsdoc -r -a -d=./dist/docs ./src/
	${ANT_HOME} -Dbasedir=. -DjGrouseHome=${JGROUSE_DOC} -DoutputDir=${DIST_DIR}/docs -DinputDir=${SRC_DIR} -f ${JGROUSE_DOC}/build.xml
	
build/create_dist: 
	@@mkdir -p ${DIST_DIR}
	@@mkdir -p ${DIST_DIR}/css
	@@mkdir -p ${DIST_DIR}/i18n
	
#join all files into one, add version and licence to the head of the file	
js: build/create_dist
	@@echo "Building" ${JS}
#	join all files into one | replace @Date variable with date command eval | replace @VERSION variable with version number
	@@cat ${JS_FILES} | sed 's/@DATE/'"${DATE}"'/' | sed s/@VERSION/${VERSION}/ > ${JS}

css: build/create_dist	
	@@echo "Building" ${JS} " css files"
	sass --update ${SRC_DIR}/sass:dist/css
	cp -R ${SRC_DIR}/sass/images dist/css
	cp -R ${SRC_DIR}/i18n/* ${DIST_DIR}/i18n
	
#run JSHint checks on the joined file (using node.js)
hint: js
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Checking jQuery against JSHint..."; \
		${JS_ENGINE} $(BUILD_DIR)/jshint-check.js ${JS} ; \
	else \
		echo "You must have NodeJS installed in order to test JS against JSHint."; \
	fi

#run node.js with uglify script that compresses the js, remove all comments. add copyright notice to the head of the file (head -12)
min: js
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Building" ${JS_MIN}; \
		head -12 ${JS} > ${JS_MIN}; \
		${COMPILER} ${JS} > ${JS_MIN}.tmp; \
		sed '$ s#^\( \*/\)\(.\+\)#\1\n\2;#' ${JS_MIN}.tmp >> ${JS_MIN}; \
		rm -rf $(JS_MIN).tmp; \
	else \
		echo "You must have NodeJS installed in order to minify JS."; \
	fi

#run rhino server and pack minified js file into even smaller size. add copyright notice at the start (head -12)
pack: min
	@@echo "Building" ${JS_PACK}

	@@head -12 ${JS} > ${JS_PACK}
	@@${PACKER} ${JS_MIN} ${JS_PACK}.tmp
	@@cat ${JS_PACK}.tmp >> ${JS_PACK} && rm ${JS_PACK}.tmp

clean:
	@@echo "Removing distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}

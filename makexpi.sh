#!/bin/bash
########################## Configuration ################################
if [ -z $1 ];then
  VER='1.2a'`date '+%Y%m%d%H%M%S'`;
else
  VER=$1;
fi

PROJECT_NAME='hupper';
START_DIR=`pwd`;
DOWNLOAD_DIR='/var/www/hupper/cvs/downloads';
TMP_DIR=/tmp;
BUILD_DIR=$TMP_DIR/hupper_$VER;
######################## Configuration END ##############################

function cleanBuild {
  if [ -d $BUILD_DIR ];then
    echo "Delete build dir";
    rm -rf $BUILD_DIR;
  fi
}
function buildXPI {
  echo "Creating Hupper installation package";
  cd chrome;
  if [ -f $PROJECT_NAME.jar ];then
    echo "Delete $PROJECT_NAME.jar";
    rm $PROJECT_NAME.jar;
  fi;
  zip -r $PROJECT_NAME.jar content/* -x \*.svn/\*;
  zip -r $PROJECT_NAME.jar locale/* -x \*.svn/*;
  zip -r $PROJECT_NAME.jar skin/* -x \*.svn/\*;

  cd ..;
  echo "Build package $PROJECT_NAME.xpi";
  rm $PROJECT_NAME*.xpi;
  zip $PROJECT_NAME.xpi chrome.manifest install.rdf \
    modules/hupdb.jsm \
    modules/styleLoader.jsm \
    modules/hupjumper.jsm \
    modules/hupstringer.jsm \
    modules/statusclickhandler.jsm \
    modules/timer.jsm \
    chrome/$PROJECT_NAME.jar defaults/preferences/$PROJECT_NAME.js license.txt -x \*.svn/\*

  echo "Replace old XPIs with the new one";
  if [ -d $DOWNLOAD_DIR ]; then
    if [ -f $DOWNLOAD_DIR/hupper_$VER.xpi ];then
      rm $DOWNLOAD_DIR/hupper_$VER.xpi;
    fi;
    cp $PROJECT_NAME.xpi $DOWNLOAD_DIR/hupper_$VER.xpi;
  else
    echo "Warning: Download dir does not exists!";
  fi;
  #if [ -f $START_DIR/$PROJECT_NAME.xpi ];then
    rm $START_DIR/$PROJECT_NAME*.xpi;
  #fi;
  cp $PROJECT_NAME.xpi $START_DIR/$PROJECT_NAME$VER.xpi;
  echo "Build finished!";
}
function setVersion {
  if [ `pwd` != $BUILD_DIR ];then
    cd $BUILD_DIR;
  fi
  echo "Set version to $VER";

  sed "s/###VERSION###/$VER/g" install.rdf > install.rdf.tmp;
  mv install.rdf.tmp install.rdf;

  sed "s/###VERSION###/$VER/g" chrome/content/$PROJECT_NAME/ajax.js > chrome/content/$PROJECT_NAME/ajax.js.tmp;
  mv chrome/content/$PROJECT_NAME/ajax.js.tmp chrome/content/$PROJECT_NAME/ajax.js;

  sed "s/###VERSION###/$VER/g" chrome/content/$PROJECT_NAME/postinstall.js > chrome/content/$PROJECT_NAME/postinstall.js.tmp;
  mv chrome/content/$PROJECT_NAME/postinstall.js.tmp chrome/content/$PROJECT_NAME/postinstall.js;
}

if [ -d $TMP_DIR ];then
  cleanBuild;
  echo "Copy current files from $START_DIR to $BUILD_DIR dir to build package";
  cp -R $START_DIR $BUILD_DIR;
  cd $BUILD_DIR;
  setVersion;
  buildXPI;
  cleanBuild;
  exit 0;
else
  echo "Temp dir not found, exit";
  exit 1;
fi

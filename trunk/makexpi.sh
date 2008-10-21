#!/bin/bash
########################## Configuration ################################
if [ -z $1 ];then
  HUPPERVER='0.0.5.2a';
else
  HUPPERVER=$1;
fi

START_DIR=`pwd`;
TMP_DIR=/tmp;
BUILD_DIR=$TMP_DIR/hupper_$HUPPERVER;
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
  if [ -f hupper.jar ];then
    echo "Delete hupper.jar";
    rm hupper.jar;
  fi;
  zip -r hupper.jar content/* -x \*.svn/\*;
  zip -r hupper.jar locale/* -x \*.svn/*;
  zip -r hupper.jar skin/* -x \*.svn/\*;

  cd ..;
  echo "Build package hupper.xpi";
  rm hupper.xpi;
  zip hupper.xpi chrome.manifest install.rdf chrome/hupper.jar defaults/preferences/hupper.js license.txt -x \*.svn/\*

  echo "Replace old XPIs with the new one";
  if [ -f $START_DIR/hupper.xpi ];then
    rm $START_DIR/hupper.xpi;
  fi;
  cp hupper.xpi $START_DIR/;
  echo "Build finished!";
}
function setVersion {
  if [ `pwd` != $BUILD_DIR ];then
    cd $BUILD_DIR;
  fi
  echo "Set version to $HUPPERVER";
  sed "s/###VERSION###/$HUPPERVER/g" install.rdf > install.rdf.tmp;
  mv install.rdf.tmp install.rdf;
  sed "s/###VERSION###/$HUPPERVER/g" chrome/content/hupper/ajax.js > chrome/content/hupper/ajax.js.tmp;
  mv chrome/content/hupper/ajax.js.tmp chrome/content/hupper/ajax.js;
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

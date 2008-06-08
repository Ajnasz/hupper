#!/bin/bash

rm chrome/hupper.jar *.xpi;

cd chrome;
zip -r hupper.jar content/* -x \*.svn/\*;
zip -r hupper.jar locale/* -x \*.svn/*;
zip -r hupper.jar skin/* -x \*.svn/\*;
cd ..;
zip hupper.xpi chrome.manifest install.rdf chrome/hupper.jar defaults/preferences/hupper.js license.txt -x \*.svn/\*

#!/usr/bin/env node

/* global settings */
var global = { keyword: process.argv[2] };
var program = require('commander');
program = require('./lib/bookly')(program);

/* read args */
program.parse(process.argv);

/* if no args, show help */
if(!global.keyword) { program.help(); }

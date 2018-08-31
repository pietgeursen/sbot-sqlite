# Scuttlebutt SQL db

> What if... we just used a relational db?

This is very very WIP. I expect to be throwing it away at some point. There's a hideous mish-mash of all the async things, some promises, pull-streams and the occasional callback. Will refactor maybe. 

## Install

`$ npm install`

`$ npm install -g knex`

## Import your feed and your friend's feeds.

`$ knex migrate:latest`

`$ knex seed:run` (takes a minute)

If you have postgres set up you can do:

`$ NODE_ENV=staging knex migrate:latest`
`$ NODE_ENV=staging knex seed:run`
`$ NODE_ENV=staging node benchmarks/index.js`

## Run the very basic benchmarks

`$ node benchmarks/index.js`

## Bench results on my laptop:

Benchmark | Sbot(ms) | SQL(ms)
---|---|---
Get all of my feed | 1308 | 228
Get all of my messages of type 'vote' | 250 | 77 
Get a single message by hash | 2.5 | 2.1 

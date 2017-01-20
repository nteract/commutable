# com·mut·a·ble

[![Greenkeeper badge](https://badges.greenkeeper.io/nteract/commutable.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/nteract/commutable.svg?branch=master)](https://travis-ci.org/nteract/commutable)
[![codecov](https://codecov.io/gh/nteract/commutable/branch/master/graph/badge.svg)](https://codecov.io/gh/nteract/commutable)

> /kəˈmyo͞otəbəl/
>
> 1. (of a place or journey) allowing regular commuting to and from work.
> 2. **capable of being exchanged or converted.**

`commutable` is a library for Jupyter Notebook operations, helping to enable
history stored as a series of immutable notebooks.

## Principles

* **A notebook document is immutable**. It is never mutated in-place.
* Changes to a notebook document are encapsulated into **operations** that take a previous version and return a new one.
* History is represented as a **list of states**, with past on one end, the present on the other, and an index that can back up into 'undo states'.
* Modifying a notebook document causes any **future states to be thrown away**.

Credits to [Tom MacWright](http://www.macwright.org/2015/05/18/practical-undo.html) for the outline.

## Installation

```
npm install --save commutable
```

## Usage

### Fresh notebook

```js
> const uuid = require('uuid').v4
undefined
> const commutable = require('.')
undefined
> nb = commutable.emptyNotebook
Map { "cellOrder": List [], "nbformat": 4, "nbformat_minor": 0, "cellMap": Map {} }

> cellID = uuid()
'd50dbdd5-1af0-4c8d-90fb-ae9ed9ff6c9b'

> nb2 = commutable.appendCell(nb, commutable.emptyCodeCell, cellID)
> nb2.toJS()
{ cellOrder: [ 'd50dbdd5-1af0-4c8d-90fb-ae9ed9ff6c9b' ],
  nbformat: 4,
  nbformat_minor: 0,
  cellMap:
   { 'd50dbdd5-1af0-4c8d-90fb-ae9ed9ff6c9b':
      { cell_type: 'code',
        execution_count: null,
        metadata: [Object],
        source: '',
        outputs: [] } } }

> nb3 = commutable.appendCell(nb2,
... commutable.emptyCodeCell.set('source', 'import random\nrandom.random()'), uuid())
> nb3.toJS()
{ cellOrder:
   [ 'd50dbdd5-1af0-4c8d-90fb-ae9ed9ff6c9b',
     '8d40321c-87c0-4d86-900c-2174f6920969' ],
  nbformat: 4,
  nbformat_minor: 0,
  cellMap:
   { 'd50dbdd5-1af0-4c8d-90fb-ae9ed9ff6c9b':
      { cell_type: 'code',
        execution_count: null,
        metadata: [Object],
        source: '',
        outputs: [] },
     '8d40321c-87c0-4d86-900c-2174f6920969':
      { cell_type: 'code',
        execution_count: null,
        metadata: [Object],
        source: 'import random\nrandom.random()',
        outputs: [] } } }
```

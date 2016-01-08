# com·mut·a·ble

> /kəˈmyo͞otəbəl/
>
> 1. (of a place or journey) allowing regular commuting to and from work.
> 2. **capable of being exchanged or converted.**

`commutable` is a library for Jupyter Notebook operations, helping to enable
history stored as a series of immutable notebooks.

## Principles

* **A Notebook is immutable**. It is never mutated in-place.
* Changes to a notebook are encapsulated into **operations** that take a previous version and return a new one.
* History is represented as a **list of states**, with past on one end, the present on the other, and an index that can back up into 'undo states'.
* Modifying a notebook causes any **future states to be thrown away**.

Credits to [Tom MacWright](http://www.macwright.org/2015/05/18/practical-undo.html) for the outline.

## Inspired by

* [Elm's time traveling debugger](http://debug.elm-lang.org/)
* [Practical Undo](http://www.macwright.org/2015/05/18/practical-undo.html)
* [Live React: Hot Reloading with Time Travel](https://www.youtube.com/watch?v=xsSnOQynTHs)

## Roadmap

Provide utilities for working with IPython/Jupyter notebooks under their common
operations.

* [x] Convert from on disk v4 format to in-memory format
* [ ] Convert from v3 to v4
* [ ] Design cell operations
* [ ] Convert from in-memory to disk format

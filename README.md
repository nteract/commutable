# commutable

Immutable notebook document model, operations, and history for Jupyter/IPython.

> #### com·mut·a·ble
> /kəˈmyo͞otəbəl/
> 1. (of a place or journey) allowing regular commuting to and from work.
> 2. **capable of being exchanged or converted.**

The underlying data structure is [immutable](https://facebook.github.io/immutable-js/). This library, `commutable`, allows for exchange and conversion.

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

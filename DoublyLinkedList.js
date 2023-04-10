export default class DoublyLinkedList {
  constructor() {
    this._first = null
    this._last = null
  }

  set first(item) {
    item.next = this._first
    if (this._first) {
      this._first.previous = item
    }
    this._first = item
    /* if only one item is in the list it's both first and last */
    if (!this._last) {
      this._last = item
    }
  }

  set last(item) {
    item.previous = this._last
    if (this._last) {
      this._last.next = item
    }
    this._last = item
    /* if only one item is in the list it's both first and last */
    if (!this._first) {
      this._first = item
    }
  }

  get first() {
    return this._first
  }

  get last() {
    return this._last
  }

  /** Returns all items as an array for convenience */
  get items() {
    if (!this.first) return []
    let array = []
    let next = this.first
    while (next !== null) {
      array.push(next)
      next = next?.next || null
    }
    return array
  }

  /* Returns all linked items between a start and ending item */
  getItemsBetween(item1, item2) {
    const items = [item1]
    let lastPushed = item1
    while (lastPushed !== item2) {
      const item = lastPushed.next
      items.push(item)
      lastPushed = item
    }
    return items
  }
}

export class LinkedListNode {
  constructor(list = null) {
    this.list = list
  }

  set next(listNode) {
    this._next = listNode
  }

  set previous(listNode) {
    this._previous = listNode
  }

  get next() {
    return this._next
  }

  get previous() {
    return this._previous
  }

  /** Return self plus next N links of list in an array */
  includeNext(numberToGet) {
    const items = [this]
    for (let i = 0; i <= numberToGet - 1; i++) {
      const next = items[items.length - 1]?.next || null
      if (next) {
        items.push(next)
      }
    }
    return items
  }

  /** Return self plus previous N links of list in an array */
  includePrevious(numberToGet) {
    const items = [this]
    for (let i = 0; i <= numberToGet - 1; i++) {
      const previous = items[0]?.previous || null
      if (previous) {
        items.unshift(previous)
      }
    }
    return items
  }
}

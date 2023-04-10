import monthsByIndex from "@/utils/monthsByIndex"
import DoublyLinkedList, { LinkedListNode } from "@/utils/DoublyLinkedList"

const addDays = (date, numDays) => {
  const newDate = new Date(date)
  newDate.setDate(date.getDate() + numDays)
  return newDate
}

const startOfWeek = (inputDate) => {
  const date = new Date(inputDate)
  const dateOflastSunday = inputDate.getDate() - inputDate.getDay()
  date.setDate(dateOflastSunday)
  return date
}

const endOfWeek = (inputDate) => {
  const date = new Date(inputDate)
  if (date.getDay() === 6) return date

  const dateOfNextSaturday = inputDate.getDate() + (6 - inputDate.getDay())
  date.setDate(dateOfNextSaturday)
  return date
}

const isSameCalendarDate = (date1, date2) => {
  return date1.toDateString() === date2.toDateString()
}

/* Calendar should have direct access to all child entities, but child entities can have relationships to each other */
export default class Calendar {
  constructor(startDate, endDate) {
    this.startDate = startDate
    this.endDate = endDate
    const firstDisplayedDate = startOfWeek(this.startDate)
    const lastDisplayedDate = endOfWeek(this.endDate)

    this.firstDisplayedDate = isSameCalendarDate(
      firstDisplayedDate,
      this.startDate
    )
      ? this.startDate
      : firstDisplayedDate

    this.lastDisplayedDate = isSameCalendarDate(lastDisplayedDate, this.endDate)
      ? this.endDate
      : lastDisplayedDate

    this._Days = Days.createBetween(
      this,
      this.firstDisplayedDate,
      this.lastDisplayedDate
    )
    this._Months = Months.createFromDays(this, this._Days)
  }

  get days() {
    return this._Days.days
  }

  get firstDay() {
    return this._Days.first
  }

  get lastDay() {
    return this._Days.last
  }

  get daysByMonth() {
    const lookup = {}
    this.days.forEach((day) => {
      if (!lookup[day.label]) {
        lookup[day.label] = [day]
      } else {
        lookup[day.label].push(day)
      }
    })
    return lookup
  }

  get months() {
    return this._Months.months
  }

  get firstMonth() {
    return this._Months.months
  }

  /** Returns 0-11, representing the index of the month of the start date */
  get startMonthNumber() {
    return this.startDate.getMonth()
  }

  /** Returns 0-11, representing the index of the month of the end date */
  get endMonthNumber() {
    return this.endDate.getMonth()
  }

  /** Returns 4-digit year of the start date */
  get startYear() {
    return this.startDate.getFullYear()
  }

  /** Returns 4-digit year of the end date */
  get endYear() {
    return this.endDate.getFullYear()
  }
}

export class Months extends DoublyLinkedList {
  constructor(calendar) {
    super()
    this.calendar = calendar
  }

  static createFromDays(calendar, days) {
    const months = new Months(calendar)

    days.monthsAndYears.forEach(([monthNumber, year]) => {
      const month = new Month(calendar, monthNumber, year)
      const daysInMonth = days.getDaysForMonthAndYear(monthNumber, year)
      month.firstDay = daysInMonth[0]
      month.lastDay = daysInMonth[daysInMonth.length - 1]
      if (!months.first) {
        months.first = month
      } else {
        months.last = month
      }
    })

    return months
  }

  get months() {
    return this.items
  }

  get firstMonth() {
    this.months[0]
  }
}

// finished here Feb 5. Realized that months do need to be a class.
// Months have their own days, but at the start of the month need to display a full week starting on Sunday
// no matter what. That means some days from last month
// must be displayed at the beginning of the month sometimes. From here, you need
// to finish the logic for adding those extra days at start of month,
// provide a first and last day (or array of days, not sure yet) to initialize the month,
// and finally shape the class and use in the Calendar for appropriate display in UI
export class Month extends LinkedListNode {
  constructor(calendar, monthNumber, year) {
    super(calendar._Months)
    this.monthNumber = monthNumber
    this.year = year
    this._firstDay = null
    this._lastDay = null
    this.calendar = calendar
  }

  hasDay(day) {
    this.days.find((dayInMonth) => day === dayInMonth)
  }

  isDayFromPriorMonth(day) {
    return this.lastMonthDisplayedDays.includes(day)
  }

  /** Get a reference to the Months class instance that this Month belongs to. */
  get Months() {
    return this.calendar._Months
  }

  /** Whether or not this month is the first that appears in the calendar instance */
  get isFirstMonthOfCalendar() {
    return this === this.Months.firstMonth
  }

  get Days() {
    if (this.firstDay) return this.firstDay.list
    if (this.lastDay) return this.lastDay.list
    return null
  }

  get days() {
    return this.Days
      ? this.Days.getItemsBetween(this.firstDay, this.lastDay)
      : []
  }

  get nextMonth() {
    return this.next
  }

  set nextMonth(month) {
    this.next = month
  }

  get previousMonth() {
    return this.previous
  }

  set previousMonth(month) {
    this.previous = month
  }

  set firstDay(day) {
    return (this._firstDay = day)
  }

  set lastDay(day) {
    return (this._lastDay = day)
  }

  get firstDay() {
    return this._firstDay
  }

  get lastDay() {
    return this._lastDay
  }

  get lastMonthDisplayedDays() {
    const days = this.firstDay.includePrevious(this.firstDay.day)
    days.pop()
    return days
  }

  get daysDisplayedNextMonth() {
    const days = this.days
    if (!this.nextMonth) return []
    if (this.nextMonth.firstDay.day === 0) return []

    return days.slice(days.length - this.nextMonth.firstDay.day)
  }

  /** Returns all days in the month plus any necessary display days from last month */
  get displayDays() {
    return [...this.lastMonthDisplayedDays, ...this.days]
  }
  //   return this.isFirstMonthOfCalendar
  //     ? [...this.lastMonthDisplayedDays, ...this.days]
  //     : this.days
  // }

  get title() {
    return `${this.name} ${this.year}`
  }

  /** Returns the full, title-cased name of the month */
  get name() {
    return monthsByIndex[this.monthNumber]
  }
}

class Days extends DoublyLinkedList {
  constructor(calendar) {
    super()
    this.calendar = calendar
  }

  static createBetween(calendar, startDate, endDate) {
    const days = new Days(calendar)
    days.first = new Day(calendar, days, startDate)
    days.last = new Day(calendar, days, endDate)
    let lastDayAdded = days.first
    let allDaysAdded = false
    while (!allDaysAdded) {
      const day = lastDayAdded.aNewTomorrow()
      if (isSameCalendarDate(day.date, days.last.date)) {
        allDaysAdded = true
      } else {
        lastDayAdded.tomorrow = day
        day.yesterday = lastDayAdded
        day.tomorrow = days.last
        days.last.yesterday = day
        lastDayAdded = day
      }
    }
    return days
  }

  get days() {
    return this.items
  }

  get months() {
    return [...new Set(this.days.map((day) => day.label))]
  }

  /** Returns an array of [month, year] arrays for each unique month represented in the linked list of Days */
  get monthsAndYears() {
    const result = []
    this.days.forEach((day) => {
      const year = day.year
      const month = day.monthNumber
      if (!result.some(([m, y]) => y === year && m === month)) {
        result.push([month, year])
      }
    })
    return result
  }

  getDaysForMonthAndYear(monthNumber, year) {
    return this.days.filter(
      (day) => day.monthNumber === monthNumber && day.year === year
    )
  }
}

export class Day extends LinkedListNode {
  constructor(calendar, days, date) {
    super(days)
    this.calendar = calendar
    this.date = date
    /** data property is provided as an arbitrary storage strategy for each day */
    this.data = {}
  }

  aNewTomorrow() {
    return new Day(this.calendar, this.list, addDays(this.date, 1))
  }

  set yesterday(day) {
    this._previous = day
  }

  set tomorrow(day) {
    this._next = day
  }

  get tomorrow() {
    return this._next
  }

  get yesterday() {
    return this._previous
  }

  get day() {
    return this.date.getDay()
  }

  get getDate() {
    return this.date.getDate()
  }

  get year() {
    return this.date.getFullYear()
  }

  get monthNumber() {
    return this.date.getMonth()
  }

  get name() {
    return {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    }[this.day]
  }

  get monthAndYear() {
    return [this.monthNumber, this.year]
  }

  /** Returns label for month and year (e.g. "January 2023") */
  get label() {
    return `${monthsByIndex[this.date.getMonth()]} ${this.date.getFullYear()}`
  }

  get onlyForDisplay() {
    return (
      this.date < this.calendar.startDate || this.date > this.calendar.endDate
    )
  }
}

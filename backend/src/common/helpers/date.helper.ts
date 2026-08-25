export class DateHelper {

  static startOfToday(): Date {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return today;
  }

  static startOfWeek(): Date {

    const date = new Date();

    const day = date.getDay();

    const diff = date.getDate() - day;

    date.setDate(diff);

    date.setHours(0, 0, 0, 0);

    return date;

  }

  static startOfMonth(): Date {

    return new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

  }

  static startOfYear(): Date {

    return new Date(
      new Date().getFullYear(),
      0,
      1,
    );

  }

}
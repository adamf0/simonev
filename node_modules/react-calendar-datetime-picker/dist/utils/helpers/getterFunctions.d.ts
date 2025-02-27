import { IDay, calendarLocal } from '../../types/type';
export declare const getNumberOfDaysInMonth: (year: number, month: number, local?: calendarLocal) => number;
export declare const getWeekday: (number: number, local: calendarLocal) => {
    weekDay: string;
    weekDayIndex: number;
};
export declare const getDateTimeStamp: (date: IDay, local?: calendarLocal) => number;

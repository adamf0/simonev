import { IDay, calendarLocal } from '../../types/type';
export declare const compareDateEN: (date1: IDay, date2: IDay) => 1 | 2 | 0;
export declare const compareDateFA: (date1: IDay, date2: IDay) => 1 | 2 | 0;
export declare const isDayBetween: (min: IDay, day: IDay, max: IDay, local: calendarLocal) => boolean;

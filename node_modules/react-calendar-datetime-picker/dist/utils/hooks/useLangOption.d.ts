import { calendarLocal } from '../../types/type';
declare const useLangOption: (locale: calendarLocal) => {
    NUMBERS: string[];
    WEEK_DAY_SHORT: string[];
    MONTHS: string[];
    WEEK_DAYS: ({
        name: string;
        short: string;
        isWeekend?: undefined;
    } | {
        name: string;
        short: string;
        isWeekend: boolean;
    })[];
    YEARS_RANGE_START: number;
    YEARS_RANGE_END: number;
    getDay: (date: import('../../types/type').IDay) => number;
    todayObject: () => {
        year: number;
        month: number;
        day: number;
    };
    getDayOfMonth: (date: import('../../types/type').IDay) => number;
    inputPlaceholder: string;
    clockFromLB: string;
    clockToLB: string;
    nextMonthBtnTL: string;
    previousMonthBtnTL: string;
    fromLB: string;
    toLB: string;
    clockLB: string;
    todayBtnTL: string;
} | {
    WEEK_DAY: string[];
    WEEK_DAY_SHORT: string[];
    MONTHS: string[];
    MONTHS_SHORT: string[];
    WEEK_DAYS: ({
        name: string;
        short: string;
        isWeekend: boolean;
    } | {
        name: string;
        short: string;
        isWeekend?: undefined;
    })[];
    YEARS_RANGE_START: number;
    YEARS_RANGE_END: number;
    getDay: (date: import('../../types/type').IDay) => number;
    todayObject: () => {
        year: number;
        month: number;
        day: number;
    };
    getDayOfMonth: (date: import('../../types/type').IDay) => number;
    inputPlaceholder: string;
    clockFromLB: string;
    clockToLB: string;
    nextMonthBtnTL: string;
    previousMonthBtnTL: string;
    fromLB: string;
    toLB: string;
    clockLB: string;
    todayBtnTL: string;
};
export { useLangOption };

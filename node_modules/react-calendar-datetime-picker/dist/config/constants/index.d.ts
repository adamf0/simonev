import { IDay } from '../../types/type';
export declare const LOCAL_CONSTANT: {
    fa: {
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
        getDay: (date: IDay) => number;
        todayObject: () => {
            year: number;
            month: number;
            day: number;
        };
        getDayOfMonth: (date: IDay) => number;
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
    en: {
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
        getDay: (date: IDay) => number;
        todayObject: () => {
            year: number;
            month: number;
            day: number;
        };
        getDayOfMonth: (date: IDay) => number;
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
};
export declare const YEARS_VIEW = "YEARS_VIEW";
export declare const MONTHS_VIEW = "MONTHS_VIEW";
export declare const DAYS_VIEW = "DAYS_VIEW";

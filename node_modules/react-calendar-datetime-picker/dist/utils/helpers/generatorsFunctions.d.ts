import { IDay, ITime } from '../../types/type';
export declare const genFullDay: (year: number, month: number, day: number) => string;
export declare const genFullIDay: (date: IDay | null | undefined, isCorrectMonth?: boolean, withTime?: boolean, showTimeInput?: boolean, time?: ITime | null | undefined) => string;
export declare const genDayObject: (year: number, month: number, day: number) => {
    year: number;
    month: number;
    day: number;
};

import { IDay, IRange, ITime, ITimeRange } from '../../types/type';
export declare const mergeProviders: (onChange: (date: any) => void, type: string, selectedDate: IDay | IRange | IDay[] | null | undefined, selectedTime: ITime | ITimeRange | null | undefined, onCalenderChange?: any, withTime?: boolean) => void;

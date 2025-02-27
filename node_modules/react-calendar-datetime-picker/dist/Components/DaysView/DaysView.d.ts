import { FC } from 'react';
import { IDay, calendarLocal } from '../../types/type';
interface IDaysProps {
    local: calendarLocal;
    type?: string;
    showWeekend: boolean;
    daysClass?: string;
    disabledDates?: IDay[];
    handelComponentVisible?: (foreClose?: boolean) => void;
}
export declare const DaysView: FC<IDaysProps>;
export {};

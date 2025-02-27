import { FC } from 'react';
import { calendarListStyle, calendarLocal } from '../../types/type';
interface IYearsProps {
    local: calendarLocal;
    yearsClass?: string;
    yearListStyle?: calendarListStyle;
}
export declare const Years: FC<IYearsProps>;
export {};

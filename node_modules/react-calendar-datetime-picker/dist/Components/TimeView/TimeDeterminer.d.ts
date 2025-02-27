import { FC } from 'react';
import { calendarLocal, calendarType } from '../../types/type';
interface ITimDeterminerProps {
    clockFromLabel?: string;
    clockToLabel?: string;
    clockLabel?: string;
    type: calendarType;
    timeClass?: string;
    local: calendarLocal;
    currentView: string;
}
export declare const TimeDeterminer: FC<ITimDeterminerProps>;
export {};

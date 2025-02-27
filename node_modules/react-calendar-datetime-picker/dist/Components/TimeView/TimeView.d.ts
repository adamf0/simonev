import { FC } from 'react';
interface ITimeViewProps {
    initHour: number | undefined;
    initMinute: number | undefined;
    timeFor?: string;
    timeLabel?: string;
    timeClass?: string;
}
export declare const TimeView: FC<ITimeViewProps>;
export {};

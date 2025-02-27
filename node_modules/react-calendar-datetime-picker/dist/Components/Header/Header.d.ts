import { FC } from 'react';
import { calendarLocal } from '../../types/type';
interface IHeaderProps {
    local: calendarLocal;
    NextBtnIcon?: any;
    PreviousBtnIcon?: any;
    nextMonthBtnTitle?: string;
    previousMonthBtnTitle?: string;
    headerClass?: string;
    autoClose?: boolean;
    handelComponentVisible?: (foreClose?: boolean) => void;
}
export declare const Header: FC<IHeaderProps>;
export {};

import { IDay } from '../../types/type';
export declare const handelInitialValues: (initValue: any, correctedType: string, local: string, maxDate?: IDay, minDate?: IDay) => {
    initCalender: {
        year: any;
        month: any;
        day: any;
    };
    initTime: {
        from: {
            hour: any;
            minute: any;
        };
        to: {
            hour: any;
            minute: any;
        };
        hour?: undefined;
        minute?: undefined;
    } | {
        hour: any;
        minute: any;
        from?: undefined;
        to?: undefined;
    } | undefined;
};

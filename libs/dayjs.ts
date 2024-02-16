import dayjsPackage from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjsPackage.extend(utc);
dayjsPackage.extend(timezone);
dayjsPackage.extend(relativeTime);
dayjsPackage.extend(customParseFormat);

export const dayjs = dayjsPackage;

import dayjsPackage from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjsPackage.extend(utc);
dayjsPackage.extend(timezone);
dayjsPackage.extend(relativeTime);
dayjsPackage.extend(customParseFormat);
dayjsPackage.extend(localizedFormat);

export const dayjs = dayjsPackage;

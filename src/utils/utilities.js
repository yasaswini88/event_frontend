import dayjs from "dayjs";

export const formatDate = (dateString, format='MM/DD/YYYY') => {
    return dayjs(dateString).format(format);
}
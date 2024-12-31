import dayjs from "dayjs";

export const formatDate = (dateString, format='MM/DD/YYYY') => {
    return dayjs(dateString).format(format);
};


export const sortData = (data, key, order = 'asc') => {
    return [...data].sort((a, b) => {
        let valueA = a[key];
        let valueB = b[key];

        // Handle undefined or null values consistently
        if (valueA == null) valueA = '';
        if (valueB == null) valueB = '';

        // Convert strings to lowercase for case-insensitive sorting
        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();

        // Handle numbers or parse strings to numbers if required
        if (!isNaN(valueA) && !isNaN(valueB)) {
            valueA = Number(valueA);
            valueB = Number(valueB);
        }

        // Convert date strings to Date objects for proper comparison
        if (dayjs(valueA).isValid() && dayjs(valueB).isValid()) {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        }

        // Perform comparison
        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;
        return 0; // Equal values
    });
};

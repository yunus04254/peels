//JEST Testing file for Helpers file
import { getTimeAgo, formatDate } from 'src/lib/helpers-date';


describe('Helpers file', () => {

    it('should return time ago format', () => {
        const now = new Date().toISOString();
        expect(getTimeAgo(now)).toBe('Just now');

        const minute = new Date();
        minute.setMinutes(minute.getMinutes() - 15);
        expect(getTimeAgo(minute.toISOString())).toBe('15m ago');

        const hour = new Date();
        hour.setHours(hour.getHours() - 3);
        expect(getTimeAgo(hour.toISOString())).toBe('3h ago');

        const day = new Date();
        day.setDate(day.getDate() - 2);
        expect(getTimeAgo(day.toISOString())).toBe('2d ago');

        const week = new Date();
        week.setDate(week.getDate() - 10);
        expect(getTimeAgo(week.toISOString())).toBe('1w ago');

        const year = new Date();
        year.setFullYear(year.getFullYear() - 2);
        expect(getTimeAgo(year.toISOString())).toBe('2y ago');
    });

    it('should return date in DD MM YYYY format', () => {
        const date1 = new Date(2024, 2, 27);
        const formattedDate1 = formatDate(date1.toISOString());
        expect(formattedDate1).toBe('27 Mar 2024');

        const date2 = new Date(2023, 7, 15);
        const formattedDate2 = formatDate(date2.toISOString());
        expect(formattedDate2).toBe('15 Aug 2023');

        const date3 = new Date(2025, 11, 1);
        const formattedDate3 = formatDate(date3.toISOString());
        expect(formattedDate3).toBe('1 Dec 2025');
    });

});
export const DAY_ADD = 86400000;

export const alignDate = (date) => {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
}

export const getDates = () => {
    let today = new Date();
    alignDate(today);

    let tomorrow = new Date(today.valueOf() + DAY_ADD);

    let dow = today.getDay();

    let later_add = Math.min(dow + 2, 5);
    if (dow === 0 || dow === 6) later_add = 0; 

    let later = new Date(today.valueOf() + ((later_add - dow) * DAY_ADD));

    let weekend = new Date(today.valueOf());
    if (dow > 0 && dow < 6)
    {
        weekend.setTime(weekend.valueOf() + ((6 - dow) * DAY_ADD));
    }

    let nextweek = new Date(today.valueOf());
    let daystonext = (7 - dow + 1) % 7; // how long to next day of week (Monday)
    if (daystonext === 0) daystonext = 7; // this means next Monday if we are already on Monday
    nextweek.setTime(nextweek.valueOf() + daystonext * DAY_ADD);
    
    let midnextweek = new Date(nextweek.valueOf());
    midnextweek.setTime(midnextweek.valueOf() + 2 * DAY_ADD);

    let twoweeks = new Date(today.valueOf());
    twoweeks.setTime(twoweeks.valueOf() + 14 * DAY_ADD); 

    let dates = [];
    dates.push({ name: 'Today', date: today });
    dates.push({ name: 'Tomorrow', date: tomorrow });
    dates.push({ name: 'Later in week', date: later });
    //dates.push({ name: 'Weekend', date: weekend });
    dates.push({ name: 'Next week', date: nextweek });
    dates.push({ name: 'Mid next week', date: midnextweek });
    dates.push({ name: '2 weeks', date: twoweeks });

    return dates;
}

export const toDateString = (date) => {
    let day = "0" + date.getDate();
    let month = "0" + (date.getMonth() + 1);
    return day.substr(day.length - 2) + "." + month.substr(month.length - 2) + "." + date.getFullYear();
}

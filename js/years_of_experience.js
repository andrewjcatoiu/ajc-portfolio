function calcYearsExperience(date_string) {
    const startDate = new Date(date_string);
    const currentDate = new Date();

    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const startDay = startDate.getDate();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    let fullYears = currentYear - startYear;

    if (currentMonth < startMonth || (currentMonth === startMonth && currentDay < startDay)) {
        fullYears--;
    }

    return fullYears;
}

const start_string = "2022-07-01";
const fullYears = calcYearsExperience(start_string);
document.getElementById('years_of_experience').textContent = fullYears;
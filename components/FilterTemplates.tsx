import { calenderDateFormat } from "app/constants"
import { Calendar } from "primereact/calendar"


const dateFilterTemplate = (options) => {
    return (
        <Calendar
            value={options.value}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            dateFormat={calenderDateFormat()}
            placeholder={calenderDateFormat()}
            mask="99/99/9999"
        />
    )
}


export { dateFilterTemplate }
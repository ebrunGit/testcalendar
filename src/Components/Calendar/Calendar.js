import React, { useEffect } from "react";
import styles from "./Calendar.module.scss";
import { events, hours } from "../../data";
import Event from "../Event/Event";

export default function Calendar() {
    const windowHeight = window.innerHeight;
    const hourSpan = (windowHeight / 12) - 1; // height of one hour in calendar minus line thickness
    const minuteSpan = (hourSpan / 12); // height of a 5-minute span

    return (
        <div className={styles.container}>
            {hours.map(hour =>
                <div className={styles.hourWrapper} style={{ height: hourSpan }} key={hour}>
                    <div className={styles.hourDiv}>
                        {hour}
                    </div>
                    <div className={styles.minutesWrapper}>
                        {events.filter(event => event.start === hour).map(e => <Event id={e.id} />)}
                    </div>
                </div>
            )}
        </div>
    );
}

/* The problem consists in rendering events on a calendar, avoiding overlapping events to visually overlap.
Your implementation should meet the two following constraints:

Every overlapping event should have the same width as every event it overlaps
Every event should use the maximum width available
A visual illustration of the problem is given below.

Rendering events on a calendar means here: the relative position of events to the top of the screen
and their height is a function of the height of the screen, the start/end time of the calendar,
and the start time/duration of the events. For example: if the calendar goes from 00:00 to 24:00
and the screen is 2400px high, an event starting at 12:00 and lasting 1h would be positioned at 1200px
of the top of the screen and have a height of 100px. */
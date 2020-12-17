import React, { useEffect, useState } from "react";
import styles from "./Calendar.module.scss";
import { events } from "../../data";
import Event from "../Event/Event";

export default function Calendar() {
    const windowSize = { width: window.innerWidth, height: window.innerHeight };
    const hourSpan = (windowSize.height / 12); // height of one hour in calendar
    const minuteSpan = (hourSpan / 60); // height of a minute
    const [eventsData, setEventsData] = useState([]);

    useEffect(() => {
        let eventsPositions = OrganizeData();
        eventsPositions = calculateWidth(eventsPositions);
        setEventsData(CalculateLeftPositions(eventsPositions));
    }, [])

    function OrganizeData() {
        SortByStartTime(events);
        let eventsPositionsTmp = [];

        events.forEach(e => {
            const startArr = e.start.split(":");
            const eventTop = (startArr[0] - 9) * hourSpan + startArr[1] * minuteSpan;
            const _eventHeight = e.duration * minuteSpan;
            const eventBottom = eventTop + _eventHeight;
            let _width = 100;

            eventsPositionsTmp.push({
                id: e.id,
                start: e.start,
                top: eventTop,
                bottom: eventBottom,
                left: 0,
                width: _width
            });
        });
        return eventsPositionsTmp;
    }

    function calculateWidth(eventsPositions) {
        let overlapChain = [];
        for (let j = 0; j < eventsPositions.length; j++) {
            if (j === 0) {
                // first element and First of an overlap chain ?
                if (eventsPositions[j].bottom > eventsPositions[j + 1].top)
                    overlapChain.push(eventsPositions[j]);
                // Else the first element is isolated so width stays at 100%
            } else if (j === eventsPositions.length - 1) {
                for (let k = 0; k < eventsPositions.length / 2; k++) {
                    if (eventsPositions[j].top > eventsPositions[j - k].top &&
                        eventsPositions[j].bottom < eventsPositions[j - k].bottom) {
                        // last element and last of an overlap chain ?
                        eventsPositions[j].width = eventsPositions[j - k].width;
                    }
                } // Else width stays at 100%
            } else if (eventsPositions[j].bottom <= eventsPositions[j + 1].top) {
                overlapChain.push(eventsPositions[j]);
                SetChainMembersWidth(overlapChain, eventsPositions);
                overlapChain = [];
            } else overlapChain.push(eventsPositions[j]);
        }
        return eventsPositions;
    }

    function SetChainMembersWidth(overlapChain) {
        let alignmentCount = 0;
        if (overlapChain.length === 3 &&
            (overlapChain[0].bottom <= overlapChain[overlapChain.length - 1].top ||
                (overlapChain[0].bottom > overlapChain[1].bottom && overlapChain[0].bottom > overlapChain[2].bottom))) {
            for (let i = 0; i < overlapChain.length; i++)
                overlapChain[i].width = 50;
                // if first and last events in a group of three don't overlap, then events width is 50 for this group
        } else {
            for (let j = 0; j < overlapChain.length; j++) {
                if (overlapChain[j].top === overlapChain[0].top ||
                    overlapChain[j].top < overlapChain[0].bottom) alignmentCount += 1;
                    // if divs completely overlap, increment var to confirm number of items in line
            }
            if (alignmentCount === overlapChain.length) {
                for (let k = 0; k < overlapChain.length; k++)
                    overlapChain[k].width = 100 / overlapChain.length;
                    //if all items ar in line equally divide width 
            } else for (let l = 0; l < overlapChain.length; l++)
                overlapChain[l].width = 100 / alignmentCount;
                //else divide width by number of items in line
        }
    }

    function CalculateLeftPositions(eventsPositions) {
        SortByStartTime(eventsPositions);
        let itemsDone = [];
        eventsPositions.forEach(e => {
            if (!itemsDone.includes(e)) {
                let newPack = [e];
                for (let i = eventsPositions.indexOf(e); i < eventsPositions.length; i++) {
                    const current = i === eventsPositions.indexOf(e) ? e : eventsPositions[i];
                    if (i === 0 || (current.top < eventsPositions[i - 1].bottom && current.top >= eventsPositions[i - 1].top)) {
                        //if current event overlaps previous event, add current event to newPack
                        if (eventsPositions[i] !== e) newPack.push(eventsPositions[i]);
                        if (i !== eventsPositions.length - 1 && current.bottom <= eventsPositions[i + 1].top) {
                            LeftPositionsSecondPart(newPack, eventsPositions);
                            // if currentEvent.bottom <= nextEvent.top then pack is complete, send it for positioning
                            break;
                        }
                    } else if (current.top >= eventsPositions[i - 1].bottom)
                        if (i !== eventsPositions.length - 1 && current.bottom <= eventsPositions[i + 1].top) break;
                        // if event is alone so no overlap, go to next event
                        else if (i === eventsPositions.length - 1)// Else specific to last item in data, dirty code
                            eventsPositions[i].left = eventsPositions[i].width;
                }
                itemsDone.push(...newPack);// add event(s) to filled events list
            }
        });
        return eventsPositions;
    }

    function LeftPositionsSecondPart(eventsPack, eventsPositions) {
        // set position of each item in the pack sent
        if (eventsPack.length > 1) {
            for (let j = 0; j < eventsPack.length; j++) {
                let item = eventsPositions[eventsPositions.indexOf(eventsPack[j])];
                if (eventsPack[j].width === 100 / eventsPack.length) {
                    item.left = eventsPack[j].width * j;
                    // set equal repartition if all items are on a line

                } else if (eventsPack[j].width === 50 && eventsPack.length > 2) {
                    FindWhoWillMoveLeft(eventsPositions, eventsPack, eventsPack[j]);

                } else {
                    const _left = eventsPack[j].width * j; 
                    item.left = _left >= 100 ? 0 : _left; // if position is beyond 100vw, get it back to 0
                }
            }
        } else if (eventsPack[0] === eventsPositions[eventsPositions.length - 1]) {
            eventsPositions[eventsPositions.indexOf(eventsPack[0])].left = 50;
            // Else specific to last item in data, dirty code
        }// Else if pack has one event, event occupies the whole screen.
    }

    function FindWhoWillMoveLeft(eventsPositions, events, current) {
        let doubleOverlap = 0;
        for (let k = 0; k < events.length; k++) {
            if (current !== events[k] &&
                current.top < events[k].top &&
                current.bottom > events[k].bottom) {
                eventsPositions[eventsPositions.indexOf(current)].left = 50;
                // if width equal 50%, and current is overlapping bottom neighbor, set position left of current to 50%
                break;
            } else { // find double overlap, if there is it's the div to shift left
                if (current.top < events[k].top &&
                    current.bottom > events[k].top &&
                    current.bottom < events[k].bottom) doubleOverlap += 1;
                //div has overlap from bottom neighbor
                if (current.top > events[k].top &&
                    current.top < events[k].bottom &&
                    current.bottom > events[k].bottom) doubleOverlap += 1;
                //div has overlap from top neighbor
            }
            if (doubleOverlap === 2)
                eventsPositions[eventsPositions.indexOf(current)].left = 50;
            //div has overlap from top and bottom neighbor
        }
    }

    function SortByStartTime(array) {
        return array.sort((a, b) => {
            const aHour = parseInt(a.start.replace(":", ""));
            const bHour = parseInt(b.start.replace(":", ""));
            if (aHour < bHour) {
                return -1;
            }
            if (aHour > bHour) {
                return 1;
            }
            if (aHour === bHour) {
                if (a.duration < b.duration) {
                    return -1;
                }
                if (a.duration > b.duration) {
                    return 1;
                }
                return 0;
            }
            return 0;
        });
    }

    return (
        <div className={styles.container}>
            {events.map((e, i) => {
                const startArr = e.start.split(":");
                const eventTop = (startArr[0] - 9) * hourSpan + startArr[1] * minuteSpan;
                const _eventHeight = e.duration * minuteSpan;
                return <div className={styles.event}
                    key={e.id}
                    style={{
                        top: eventTop * 100 / windowSize.height + "%",
                        //règle de trois pour trouver le % a partir de la var eventTop
                        left: eventsData.length === 0 ? 0 : eventsData[i].left + "%",
                        width: eventsData.length === 0 ? "100%" : eventsData[i].width + "%"
                    }}>
                    <Event id={e.id} eventHeight={_eventHeight} />
                </div>
            })}
        </div>
    );
}
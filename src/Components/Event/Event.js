import React from "react";
import styles from "./Event.module.scss";

export default function Event({ id, eventHeight }) {
    return (
        <div className={styles.eventBlockFormat} style={{ height: eventHeight }}>
            {id}
        </div>
    );
}
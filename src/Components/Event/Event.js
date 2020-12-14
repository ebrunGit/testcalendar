import React from "react";
import styles from "./Event.module.scss";

export default function Event({id}) {
    return (
        <div className={styles.eventBlockFormat}>
            {id}
        </div>
    );
}
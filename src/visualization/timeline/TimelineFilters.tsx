import { For, type Component } from "solid-js";
import type { TimelineFiltersProps } from "../../types/timeline";
import type { EventType } from "../../types/events";
import styles from "./TimelineFilters.module.css";

const EVENT_TYPES: EventType[] = [
	"signal-read",
	"signal-write",
	"computation-execute-start",
	"computation-execute-end",
	"computation-dispose",
];

export const TimelineFilters: Component<TimelineFiltersProps> = (props) => {
	const toggleEventType = (type: EventType) => {
		const newTypes = new Set(props.filter.enabledEventTypes);
		if (newTypes.has(type)) {
			newTypes.delete(type);
		} else {
			newTypes.add(type);
		}
		props.onChange?.({
			...props.filter,
			enabledEventTypes: newTypes,
		});
	};

	return (
		<div class={styles.filters}>
			<h4>Event Types</h4>
			<For each={EVENT_TYPES}>
				{(type) => (
					<label class={styles.checkbox}>
						<input
							type="checkbox"
							checked={props.filter.enabledEventTypes.has(type)}
							onChange={() => toggleEventType(type)}
						/>
						{type}
					</label>
				)}
			</For>
		</div>
	);
};

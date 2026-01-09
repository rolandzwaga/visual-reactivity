import styles from "./WelcomeMessage.module.css";

interface WelcomeMessageProps {
	onOpenMenu: () => void;
}

export function WelcomeMessage(props: WelcomeMessageProps) {
	return (
		<div class={styles.container} data-testid="welcome-message">
			<div class={styles.content}>
				<h2 class={styles.title}>Welcome to Visual Reactivity</h2>
				<p class={styles.description}>
					Explore interactive demos to understand reactive programming concepts
				</p>
				<button
					type="button"
					class={styles.button}
					onClick={props.onOpenMenu}
					data-testid="welcome-open-menu"
				>
					Browse Demos
				</button>
			</div>
		</div>
	);
}

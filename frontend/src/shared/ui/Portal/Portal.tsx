import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
	/** The content to render in the portal */
	children: ReactNode;
	/** The DOM element to mount the portal to */
	container?: HTMLElement | null;
	/** The ID of an existing DOM element to mount the portal to */
	containerId?: string;
	/** Callback when the portal is mounted */
	onMount?: () => void;
	/** Role for accessibility */
	role?: string;
	/** ARIA label for accessibility */
	ariaLabel?: string;
}

const Portal: React.FC<PortalProps> = ({
	children,
	container,
	containerId,
	onMount,
	role = "dialog",
	ariaLabel,
}) => {
	const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

	useEffect(() => {
		let element: HTMLElement | null = null;

		// Try to find or create the container
		if (container) {
			element = container;
		} else if (containerId) {
			element = document.getElementById(containerId);
			if (!element) {
				element = document.createElement("div");
				element.id = containerId;
				document.body.appendChild(element);
			}
		} else {
			element = document.createElement("div");
			document.body.appendChild(element);
		}

		// Set accessibility attributes
		if (role) {
			element.setAttribute("role", role);
		}
		if (ariaLabel) {
			element.setAttribute("aria-label", ariaLabel);
		}

		setMountNode(element);
		onMount?.();

		// Cleanup
		return () => {
			if (!container && !containerId && element?.parentElement) {
				element.parentElement.removeChild(element);
			}
		};
	}, [container, containerId, onMount, role, ariaLabel]);

	if (!mountNode) {
		return null;
	}

	return createPortal(
		<div role={role} aria-label={ariaLabel}>
			{children}
		</div>,
		mountNode,
	);
};

export default Portal;

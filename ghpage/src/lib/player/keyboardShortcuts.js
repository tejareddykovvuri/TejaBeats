import { audioPlayer } from './audioService.js';
import { currentTrack, toggleLike, showNotification } from './playerStore.js';

/**
 * Keyboard shortcuts matching KeyboardShortcutsHandler from the EXE.
 *
 * | Key              | Action            |
 * |------------------|-------------------|
 * | Space            | Play / Pause      |
 * | → / ←            | Seek ±5 s         |
 * | Shift+→ / Shift+← | Next / Previous |
 * | ↑ / ↓            | Volume ±5 %       |
 * | L                | Toggle like       |
 * | S                | Toggle shuffle    |
 * | R                | Cycle loop mode   |
 * | Ctrl+K           | Focus Search      |
 */
export function registerKeyboardShortcuts() {
	if (typeof window === 'undefined') return () => {};

	function handler(e) {
		// Ctrl+K → Focus search (works even in inputs)
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			// Dispatch a custom event that the page component listens for
			window.dispatchEvent(new CustomEvent('tejabeats:goToSearch'));
			return;
		}

		// Don't intercept when typing in input fields
		const tag = e.target?.tagName?.toLowerCase();
		if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) {
			return;
		}

		switch (e.key) {
			case ' ':
				e.preventDefault();
				audioPlayer.togglePlayPause();
				break;
			case 'ArrowRight':
				e.preventDefault();
				if (e.shiftKey) {
					audioPlayer.nextTrack();
					showNotification('Next Track', 'info');
				} else {
					audioPlayer.seek((audioPlayer.audio?.currentTime || 0) + 5);
				}
				break;
			case 'ArrowLeft':
				e.preventDefault();
				if (e.shiftKey) {
					audioPlayer.previousTrack();
					showNotification('Previous Track', 'info');
				} else {
					audioPlayer.seek((audioPlayer.audio?.currentTime || 0) - 5);
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				audioPlayer.setVolume((audioPlayer.audio?.volume || 0.85) + 0.05);
				break;
			case 'ArrowDown':
				e.preventDefault();
				audioPlayer.setVolume((audioPlayer.audio?.volume || 0.85) - 0.05);
				break;
			case 'l':
			case 'L':
				if (!e.ctrlKey && !e.metaKey) {
					let track = null;
					currentTrack.subscribe((t) => (track = t))();
					if (track) toggleLike(track);
				}
				break;
			case 's':
			case 'S':
				if (!e.ctrlKey && !e.metaKey) {
					audioPlayer.toggleShuffle();
				}
				break;
			case 'r':
			case 'R':
				if (!e.ctrlKey && !e.metaKey) {
					audioPlayer.cycleRepeat();
				}
				break;
		}
	}

	window.addEventListener('keydown', handler);
	return () => window.removeEventListener('keydown', handler);
}

export const initKeyboardShortcuts = registerKeyboardShortcuts;


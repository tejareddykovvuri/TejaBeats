<!-- ToastNotification.svelte — Matching EXE SnackbarService -->
<script>
	import { notification } from '$lib/player/playerStore.js';
</script>

{#if $notification}
	<div class="fixed bottom-28 lg:bottom-28 left-1/2 -translate-x-1/2 z-[999] animate-scale-up select-none pointer-events-none">
		<div class="px-5 py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] border backdrop-blur-2xl text-[13.5px] font-bold flex items-center gap-3 max-w-md
			{$notification.type === 'success' ? 'bg-[#34D399]/20 border-[#34D399]/40 text-[#34D399] shadow-[0_0_24px_rgba(52,211,153,0.3)]' :
			 $notification.type === 'error' ? 'bg-[#EF4444]/20 border-[#EF4444]/40 text-[#EF4444] shadow-[0_0_24px_rgba(239,68,68,0.3)]' :
			 'bg-[#141418]/95 border-[#FF2D78]/40 text-[#F5F5F7] shadow-[0_0_24px_rgba(255,45,120,0.3)]'}">
			{#if $notification.type === 'success'}
				<div class="w-6 h-6 rounded-full bg-[#34D399]/20 flex items-center justify-center shrink-0">
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
				</div>
			{:else if $notification.type === 'error'}
				<div class="w-6 h-6 rounded-full bg-[#EF4444]/20 flex items-center justify-center shrink-0">
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
				</div>
			{:else}
				<div class="w-6 h-6 rounded-full bg-[#FF2D78]/20 flex items-center justify-center shrink-0 text-[#FF2D78]">
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
				</div>
			{/if}
			<span class="truncate">{$notification.message}</span>
		</div>
	</div>
{/if}

import { useScrollCanvas } from '../../../hooks/useScrollCanvas'

export default function ScrollCanvas({ scrollExperience, triggerRef, className = '' }) {
	const { canvasRef, isReady, loadProgress } = useScrollCanvas({
		scrollExperience,
		triggerRef,
	})

	return (
		<div className={`scroll-canvas-wrapper ${className}`}>
			<canvas
				ref={canvasRef}
				className="scroll-canvas absolute inset-0 w-full h-full object-cover"
				aria-hidden="true"
			/>
			{!isReady && (
				<div className="scroll-canvas-loader absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] z-10">
					<div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
						<div
							className="h-full bg-[var(--cinematic-accent)] transition-all duration-300"
							style={{ width: `${Math.round(loadProgress * 100)}%` }}
						/>
					</div>
					<p className="mt-4 text-sm text-white/50 font-geist-mono tracking-widest uppercase">
						Loading experience
					</p>
				</div>
			)}
		</div>
	)
}

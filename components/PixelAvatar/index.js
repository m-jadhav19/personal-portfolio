import { useState, useEffect } from 'react'

export function PixelAvatar() {
	const [variant, setVariant] = useState('normal')

	useEffect(() => {
		const interval = setInterval(() => {
			const random = Math.random()
			if (random < 0.1) {
				setVariant('blink')
				setTimeout(() => setVariant('normal'), 200)
			} else if (random < 0.2) {
				setVariant('smile')
				setTimeout(() => setVariant('normal'), 1000)
			} else if (random < 0.25) {
				setVariant('surprised')
				setTimeout(() => setVariant('normal'), 800)
			}
		}, 3000)

		return () => clearInterval(interval)
	}, [])

	return (
		<div className='flex flex-col items-center gap-4'>
			<svg
				width='120'
				height='120'
				viewBox='0 0 120 120'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
				className='pixel-fade-in'>
				{/* Hair */}
				<rect
					x='10'
					y='5'
					width='100'
					height='20'
					fill='#2D1810'
				/>
				<rect
					x='5'
					y='10'
					width='110'
					height='15'
					fill='#2D1810'
				/>
				<rect
					x='10'
					y='15'
					width='100'
					height='10'
					fill='#2D1810'
				/>
				<rect
					x='15'
					y='20'
					width='90'
					height='5'
					fill='#2D1810'
				/>
				<rect
					x='20'
					y='25'
					width='80'
					height='3'
					fill='#2D1810'
				/>

				{/* Hair Sideburns */}
				<rect
					x='5'
					y='25'
					width='0'
					height='20'
					fill='#2D1810'
				/>
				<rect
					x='100'
					y='25'
					width='0'
					height='20'
					fill='#2D1810'
				/>

				{/* Head */}
				<rect
					x='20'
					y='20'
					width='80'
					height='80'
					fill='#D4A574'
				/>
				<rect
					x='15'
					y='25'
					width='5'
					height='70'
					fill='#2D1810'
				/>
				<rect
					x='100'
					y='25'
					width='5'
					height='70'
					fill='#2D1810'
				/>
				<rect
					x='20'
					y='15'
					width='80'
					height='10'
					fill='#2D1810'
				/>
				<rect
					x='20'
					y='100'
					width='80'
					height='5'
					fill='#D4A574'
				/>

				{/* Glasses Frame */}
				<rect
					x='30'
					y='35'
					width='25'
					height='25'
					fill='none'
					stroke='#1B1B1B'
					strokeWidth='2'
				/>
				<rect
					x='65'
					y='35'
					width='25'
					height='25'
					fill='none'
					stroke='#1B1B1B'
					strokeWidth='2'
				/>
				<rect
					x='55'
					y='45'
					width='10'
					height='2'
					fill='#1B1B1B'
				/>

				{/* Eyes */}
				{variant === 'blink' ? (
					<>
						<rect
							x='35'
							y='45'
							width='15'
							height='3'
							fill='#1B1B1B'
						/>
						<rect
							x='70'
							y='45'
							width='15'
							height='3'
							fill='#1B1B1B'
						/>
					</>
				) : (
					<>
						<rect
							x='35'
							y='40'
							width='15'
							height='15'
							fill='#1B1B1B'
						/>
						<rect
							x='70'
							y='40'
							width='15'
							height='15'
							fill='#1B1B1B'
						/>
						<rect
							x='40'
							y='43'
							width='5'
							height='5'
							fill='#A3D8F4'
						/>
						<rect
							x='75'
							y='43'
							width='5'
							height='5'
							fill='#A3D8F4'
						/>
					</>
				)}

				{/* Nose */}
				<rect
					x='55'
					y='55'
					width='10'
					height='10'
					fill='#B8956A'
				/>

				{/* Mouth */}
				{variant === 'smile' ? (
					<>
						<rect
							x='40'
							y='70'
							width='5'
							height='5'
							fill='#1B1B1B'
						/>
						<rect
							x='75'
							y='70'
							width='5'
							height='5'
							fill='#1B1B1B'
						/>
						<rect
							x='45'
							y='75'
							width='30'
							height='5'
							fill='#1B1B1B'
						/>
					</>
				) : variant === 'surprised' ? (
					<>
						<rect
							x='50'
							y='70'
							width='20'
							height='20'
							fill='#1B1B1B'
						/>
						<rect
							x='55'
							y='75'
							width='10'
							height='10'
							fill='#D4A574'
						/>
					</>
				) : (
					<rect
						x='45'
						y='70'
						width='30'
						height='5'
						fill='#1B1B1B'
					/>
				)}

				{/* Beard */}
				<rect
					x='25'
					y='80'
					width='70'
					height='20'
					fill='#2D1810'
				/>
				<rect
					x='20'
					y='85'
					width='80'
					height='15'
					fill='#2D1810'
				/>
				<rect
					x='25'
					y='90'
					width='70'
					height='10'
					fill='#2D1810'
				/>
				<rect
					x='30'
					y='95'
					width='60'
					height='5'
					fill='#2D1810'
				/>
				<rect
					x='35'
					y='100'
					width='50'
					height='3'
					fill='#2D1810'
				/>

				{/* Beard Side Extensions */}
				<rect
					x='15'
					y='85'
					width='10'
					height='15'
					fill='#2D1810'
				/>
				<rect
					x='95'
					y='85'
					width='10'
					height='15'
					fill='#2D1810'
				/>

				{/* Fuller Mustache */}
				<rect
					x='35'
					y='75'
					width='20'
					height='8'
					fill='#2D1810'
				/>
				<rect
					x='65'
					y='75'
					width='20'
					height='8'
					fill='#2D1810'
				/>
				<rect
					x='40'
					y='78'
					width='15'
					height='5'
					fill='#2D1810'
				/>
				<rect
					x='65'
					y='78'
					width='15'
					height='5'
					fill='#2D1810'
				/>

				{/* Border effect */}
				<rect
					x='20'
					y='20'
					width='80'
					height='5'
					fill='rgba(163, 216, 244, 0.3)'
				/>
			</svg>

			{/* MJ Monogram */}
			<div className='pixel-font text-[10px] text-[#A3D8F4] tracking-wider'>MJ</div>
		</div>
	)
}

export default PixelAvatar

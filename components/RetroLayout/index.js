import {useState, useEffect} from 'react'
import {motion} from 'framer-motion'
import {WeatherBackground} from '../WeatherBackground'
import RetroHeader from '../RetroHeader'
import RetroHero from '../RetroHero'
import RetroWork from '../RetroWork'
import RetroAbout from '../RetroAbout'
import {RetroFooter} from '../RetroFooter'
import {RetroContact} from '../RetroContact'

const RetroLayout = () => {
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Simulate loading time for weather API
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 2000)

		return () => clearTimeout(timer)
	}, [])

	const handleWorkScroll = () => {
		const workSection = document.getElementById('work')
		if (workSection) {
			workSection.scrollIntoView({behavior: 'smooth'})
		}
	}

	const handleAboutScroll = () => {
		const aboutSection = document.getElementById('about')
		if (aboutSection) {
			aboutSection.scrollIntoView({behavior: 'smooth'})
		}
	}

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-b from-[#4A9FD8] to-[#1E293B] flex items-center justify-center'>
				<motion.div
					className='text-center'
					initial={{opacity: 0, scale: 0.8}}
					animate={{opacity: 1, scale: 1}}
					transition={{duration: 0.6}}>
					<div className='font-pixel text-white text-lg mb-4'>LOADING PORTFOLIO...</div>
					<div className='flex justify-center space-x-2'>
						{[...Array(3)].map((_, i) => (
							<motion.div
								key={i}
								className='w-2 h-2 bg-[#FDB813] rounded-full'
								animate={{
									scale: [1, 1.5, 1],
									opacity: [0.5, 1, 0.5],
								}}
								transition={{
									duration: 1,
									repeat: Infinity,
									delay: i * 0.2,
								}}
							/>
						))}
					</div>
				</motion.div>
			</div>
		)
	}

	return (
		<div className='min-h-screen relative overflow-x-hidden'>
			{/* Weather-reactive pixel background */}
			<WeatherBackground />

			{/* Main Content */}
			<div className='relative z-10'>
				<RetroHeader
					handleWorkScroll={handleWorkScroll}
					handleAboutScroll={handleAboutScroll}
				/>

				<main>
					<RetroHero handleWorkScroll={handleWorkScroll} />
					<RetroWork />
					<RetroAbout />
					<RetroContact />
				</main>

				<RetroFooter />
			</div>
		</div>
	)
}

export default RetroLayout

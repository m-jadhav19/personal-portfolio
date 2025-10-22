import {motion} from 'framer-motion'
import {Code, Palette, Zap, Heart} from 'lucide-react'
import data from '../../data/portfolio.json'

export function RetroAbout() {
	// Map icon names to actual components
	const iconMap = {
		Code,
		Palette,
		Zap,
		Heart,
	}

	// Transform skills from portfolio.json
	const skills = data.aboutSkills.map((skill) => ({
		...skill,
		icon: iconMap[skill.icon],
	}))

	return (
		<section
			id='about'
			className='min-h-screen py-24 px-6 relative z-10'>
			<div className='max-w-4xl mx-auto'>
				{/* Section Header */}
				<motion.div
					className='text-center mb-16'
					initial={{opacity: 0, y: 20}}
					whileInView={{opacity: 1, y: 0}}
					viewport={{once: true}}
					transition={{duration: 0.6}}>
					<motion.div
						className='inline-block mb-4'
						whileHover={{scale: 1.05}}>
						<h2
							className='pixel-font text-[#1E293B] leading-relaxed'
							style={{
								fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
								textShadow: '3px 3px 0 rgba(74, 159, 216, 0.3)',
							}}>
							About Me
						</h2>
					</motion.div>
					<p className='text-[#1E293B]/70'>Level 99 Developer</p>
				</motion.div>

				{/* Bio */}
				<motion.div
					className='mb-12 bg-white/95 backdrop-blur-sm p-8 shadow-lg'
					initial={{opacity: 0, y: 30}}
					whileInView={{opacity: 1, y: 0}}
					viewport={{once: true}}
					transition={{duration: 0.6, delay: 0.2}}
					whileHover={{y: -4, boxShadow: '0 12px 30px rgba(74, 159, 216, 0.2)'}}
					style={{border: '3px solid #4A9FD8'}}>
					<div className='h-1 w-20 bg-gradient-to-r from-[#FDB813] to-[#4A9FD8] mb-6' />
					<p className='text-[#1E293B]/80 leading-relaxed mb-4'>{data.aboutParaLine1}</p>
					<p className='text-[#1E293B]/80 leading-relaxed mb-4'>{data.aboutParaLine2}</p>
					<p className='text-[#1E293B]/80 leading-relaxed'>{data.aboutParaLine3}</p>
				</motion.div>

				{/* Skills and Stats Grid - 2x2 Layout */}
				<div className='space-y-8'>
					<div className='grid grid-cols-2 md:grid-cols-2 gap-6'>
						{/* Performance Card from aboutSkills */}
						{skills.map((skill, index) => {
							const Icon = skill.icon
							return (
								<motion.div
									key={skill.title}
									className='bg-white/95 backdrop-blur-sm p-6 group shadow-lg'
									style={{
										border: `3px solid ${skill.color}`,
									}}
									initial={{opacity: 0, y: 30}}
									whileInView={{opacity: 1, y: 0}}
									viewport={{once: true}}
									transition={{duration: 0.5, delay: 0.7}}
									whileHover={{
										y: -8,
										boxShadow: `0 12px 30px ${skill.color}40`,
									}}>
									<div className='flex items-start gap-4'>
										<motion.div
											className='p-3 border-3 relative'
											style={{
												border: `3px solid ${skill.color}`,
												backgroundColor: `${skill.color}20`,
											}}
											whileHover={{rotate: [0, -10, 10, 0], scale: 1.1}}
											transition={{duration: 0.5}}>
											<Icon
												size={24}
												style={{color: skill.color}}
											/>
											{/* Pixel corner */}
											<motion.div
												className='absolute -top-1 -right-1 w-2 h-2'
												style={{backgroundColor: skill.color}}
												initial={{scale: 0}}
												whileHover={{scale: 1}}
											/>
										</motion.div>
										<div>
											<h3
												className='pixel-font text-[12px] mb-2 leading-relaxed'
												style={{color: skill.color}}>
												{skill.title}
											</h3>
											<p className='text-[#1E293B]/70 text-sm'>{skill.description}</p>
										</div>
									</div>
								</motion.div>
							)
						})}
					</div>
				</div>
			</div>
		</section>
	)
}

export default RetroAbout

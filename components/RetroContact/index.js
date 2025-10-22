/* eslint-disable react/no-unescaped-entities */
import {motion} from 'framer-motion'
import {Mail, Github, Linkedin, Twitter} from 'lucide-react'
import data from '../../data/portfolio.json'

export function RetroContact() {
	const socialLinks = [
		{
			icon: Github,
			label: 'GitHub',
			url: data.socials.find((s) => s.title === 'Github')?.link || 'https://github.com',
			color: '#1E293B',
		},
		{
			icon: Linkedin,
			label: 'LinkedIn',
			url: data.socials.find((s) => s.title === 'LinkedIn')?.link || 'https://linkedin.com',
			color: '#4A9FD8',
		},
		{
			icon: Twitter,
			label: 'Twitter',
			url: 'https://twitter.com',
			color: '#4A9FD8',
		},
		{
			icon: Mail,
			label: 'Email',
			url: data.socials.find((s) => s.title === 'Email')?.link || 'mailto:mandar@example.com',
			color: '#FDB813',
		},
	]

	return (
		<section
			id='contact'
			className='min-h-screen py-24 px-6 relative z-10 flex items-center'>
			<div className='max-w-4xl mx-auto w-full'>
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
							Get In Touch
						</h2>
					</motion.div>
					<p className='text-[#1E293B]/70'>Let&apos;s create something amazing together</p>
				</motion.div>

				{/* Contact Card */}
				<motion.div
					className='bg-white/95 backdrop-blur-sm p-12 relative overflow-hidden shadow-2xl'
					initial={{opacity: 0, scale: 0.9}}
					whileInView={{opacity: 1, scale: 1}}
					viewport={{once: true}}
					transition={{duration: 0.6, delay: 0.2}}
					style={{
						border: '4px solid #4A9FD8',
					}}>
					{/* Top accent */}
					<div className='absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FDB813] via-[#4A9FD8] to-[#5CC167]' />

					<div className='relative z-10'>
						<p className='text-[#1E293B]/80 text-center mb-8 leading-relaxed max-w-2xl mx-auto'>
							I&apos;m always open to new opportunities, collaborations, or just a friendly chat about tech and retro gaming!
						</p>

						{/* Social Links */}
						<div className='flex justify-around gap-2 mb-8'>
							{socialLinks.map((link, index) => {
								const Icon = link.icon
								return (
									<motion.a
										key={link.label}
										href={link.url}
										target='_blank'
										rel='noopener noreferrer'
										className='group flex flex-col items-center gap-3 bg-white p-6 shadow-lg'
										style={{
											border: `3px solid ${link.color}`,
										}}
										initial={{opacity: 0, y: 20}}
										whileInView={{opacity: 1, y: 0}}
										viewport={{once: true}}
										transition={{duration: 0.4, delay: 0.4 + index * 0.1}}
										whileHover={{
											y: -8,
											scale: 1.05,
											boxShadow: `0 12px 30px ${link.color}40`,
										}}>
										<motion.div
											className='p-3 border-3 relative'
											style={{
												border: `3px solid ${link.color}`,
												backgroundColor: `${link.color}20`,
											}}
											whileHover={{rotate: 360}}
											transition={{duration: 0.6}}>
											<Icon
												size={24}
												style={{color: link.color}}
											/>
											{/* Corner pixel */}
											<motion.div
												className='absolute -top-1 -right-1 w-2 h-2'
												style={{backgroundColor: link.color}}
												initial={{scale: 0}}
												whileHover={{scale: 1}}
											/>
										</motion.div>
										<span
											className='pixel-font text-[10px]'
											style={{color: link.color}}>
											{link.label}
										</span>
									</motion.a>
								)
							})}
						</div>

						{/* Email CTA */}
						<motion.div
							className='text-center'
							initial={{opacity: 0}}
							whileInView={{opacity: 1}}
							viewport={{once: true}}
							transition={{duration: 0.6, delay: 0.8}}>
							<motion.a
								href={data.socials.find((s) => s.title === 'Email')?.link || 'mailto:mandar@example.com'}
								className='inline-block pixel-font text-[12px] bg-[#4A9FD8] text-white px-10 py-4 shadow-lg relative overflow-hidden'
								whileHover={{
									scale: 1.05,
									y: -4,
									boxShadow: '0 12px 30px rgba(74, 159, 216, 0.4)',
								}}
								whileTap={{scale: 0.98}}>
								<motion.span
									className='relative z-10'
									whileHover={{letterSpacing: '0.1em'}}
									transition={{duration: 0.3}}>
									SEND MESSAGE
								</motion.span>
								<motion.div
									className='absolute inset-0 bg-[#FDB813]'
									initial={{x: '-100%'}}
									whileHover={{x: 0}}
									transition={{duration: 0.3}}
								/>
							</motion.a>
						</motion.div>
					</div>

					{/* Decorative pixels */}
					<motion.div
						className='absolute top-4 right-4 w-4 h-4 bg-[#FDB813]'
						animate={{
							opacity: [0.5, 1, 0.5],
							scale: [1, 1.3, 1],
						}}
						transition={{duration: 2, repeat: Infinity}}
					/>
					<motion.div
						className='absolute bottom-4 left-4 w-4 h-4 bg-[#5CC167]'
						animate={{
							opacity: [0.5, 1, 0.5],
							scale: [1, 1.3, 1],
						}}
						transition={{duration: 2, repeat: Infinity, delay: 1}}
					/>

					{/* Bottom accent */}
					<div className='absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#5CC167] via-[#4A9FD8] to-[#FDB813]' />
				</motion.div>
			</div>
		</section>
	)
}

export default RetroContact

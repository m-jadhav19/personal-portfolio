/* eslint-disable @next/next/no-img-element */
import React from 'react'

const WorkCard = ({ img, name, description, url }) => {
	const href = url || '#'
	const isExternal = href !== '#'

	return (
		<a
			href={href}
			{...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
			className='work-card block no-underline overflow-hidden rounded-lg p-2 laptop:p-4 first:ml-0 link cursor-pointer text-inherit'
		>
			<div className='relative rounded-lg overflow-hidden transition-all ease-out duration-300 h-64 laptop:h-80 ripple-container'>
				<img
					alt={name}
					className='w-full h-full object-cover transition-all ease-out duration-300'
					src={img}
				/>
				<div className='ripple-effect'></div>
			</div>
			<h1 className='mt-5 text-3xl font-medium'>{name ? name : 'Project Name'}</h1>
			<h2 className='text-xl opacity-50'>{description ? description : 'Description'}</h2>
		</a>
	)
}

export default WorkCard

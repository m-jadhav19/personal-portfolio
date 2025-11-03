/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import Modal from '../Modal'

const WorkCard = ({img, name, description, onClick, url}) => {
	const [isModalOpen, setIsModalOpen] = useState(false)

	const handleCardClick = () => {
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
	}

	return (
		<>
			<div
				className='work-card overflow-hidden rounded-lg p-2 laptop:p-4 first:ml-0 link cursor-pointer'
				onClick={handleCardClick}>
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
			</div>

			{/* Modal using new component */}
			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title={name}
				description={description}
				url={url}
			>
				<iframe
					src={url}
					title={name}
					loading="lazy"
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
				/>
			</Modal>
		</>
	)
}

export default WorkCard

import Image from 'next/image'
import Router, { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CinematicLayout from '../../components/cinematic/CinematicLayout'
import data from '../../data/portfolio.json'
import { ISOToDate } from '../../utils'
import { getAllPosts } from '../../utils/api'

const Blog = ({ posts }) => {
	const router = useRouter()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		if (!data.showBlog) {
			router.push('/')
		}
	}, [router])

	const createBlog = () => {
		if (process.env.NODE_ENV === 'development') {
			fetch('/api/blog', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}).then(() => {
				router.reload(window.location.pathname)
			})
		} else {
			alert('This thing only works in development mode.')
		}
	}

	const deleteBlog = (slug) => {
		if (process.env.NODE_ENV === 'development') {
			fetch('/api/blog', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ slug }),
			}).then(() => {
				router.reload(window.location.pathname)
			})
		} else {
			alert('This thing only works in development mode.')
		}
	}

	if (!data.showBlog) return null

	return (
		<CinematicLayout title="Blog" description="Thoughts on frontend development and design.">
			<div className="mb-12">
				<p className="font-geist-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-4">Writing</p>
				<h1 className="font-space-grotesk text-4xl tablet:text-6xl font-bold">Blog.</h1>
			</div>

			<div className="grid grid-cols-1 tablet:grid-cols-2 gap-8">
				{posts &&
					posts.map((post) => (
						<article
							key={post.slug}
							className="cinematic-blog-card cursor-pointer group"
							onClick={() => Router.push(`/blog/${post.slug}`)}
							onKeyDown={(e) => e.key === 'Enter' && Router.push(`/blog/${post.slug}`)}
							role="button"
							tabIndex={0}
						>
							<div className="relative w-full h-52 overflow-hidden">
								<Image
									src={post.image}
									alt={post.title}
									layout="fill"
									objectFit="cover"
									className="group-hover:scale-105 transition-transform duration-500"
									unoptimized
								/>
							</div>
							<div className="p-6">
								<h2 className="font-space-grotesk text-xl font-bold mb-2 group-hover:text-[var(--cinematic-accent)] transition-colors">
									{post.title}
								</h2>
								<p className="text-white/50 text-sm mb-3 line-clamp-2">{post.preview}</p>
								<span className="text-xs text-white/30 font-geist-mono uppercase tracking-wider">
									{ISOToDate(post.date)}
								</span>
							</div>
							{process.env.NODE_ENV === 'development' && mounted && (
								<button
									type="button"
									onClick={(e) => {
										deleteBlog(post.slug)
										e.stopPropagation()
									}}
									className="absolute top-4 right-4 px-3 py-1 text-xs bg-red-500/20 border border-red-500/40 rounded-full text-red-300"
								>
									Delete
								</button>
							)}
						</article>
					))}
			</div>

			{process.env.NODE_ENV === 'development' && mounted && (
				<button
					type="button"
					onClick={createBlog}
					className="fixed bottom-6 right-6 cinematic-accent-btn px-6 py-3 rounded-full text-sm uppercase tracking-widest"
				>
					Add New Post
				</button>
			)}
		</CinematicLayout>
	)
}

export async function getStaticProps() {
	const posts = getAllPosts(['slug', 'title', 'image', 'preview', 'author', 'date'])

	return {
		props: {
			posts: [...posts],
		},
	}
}

export default Blog

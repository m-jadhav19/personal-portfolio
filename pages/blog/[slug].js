import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import CinematicLayout from '../../components/cinematic/CinematicLayout'
import ContentSection from '../../components/ContentSection'
import BlogEditor from '../../components/BlogEditor'
import data from '../../data/portfolio.json'
import { getPostBySlug, getAllPosts } from '../../utils/api'

const BlogPost = ({ post }) => {
	const [showEditor, setShowEditor] = useState(false)
	const router = useRouter()

	return (
		<CinematicLayout title={post.title} description={post.preview}>
			<article>
				<div className="relative w-full h-56 mob:h-72 laptop:h-96 rounded-2xl overflow-hidden mb-10 cinematic-glass-panel">
					<Image
						src={post.image}
						alt={post.title}
						layout="fill"
						objectFit="cover"
					/>
				</div>
				<p className="font-geist-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-4">Blog Post</p>
				<h1 className="font-space-grotesk text-3xl tablet:text-5xl laptop:text-6xl font-bold mb-4">
					{post.title}
				</h1>
				<h2 className="text-xl text-white/50 mb-10 max-w-3xl">{post.tagline}</h2>
				<div className="cinematic-subpage-content prose-invert">
					<ContentSection content={post.content} />
				</div>
			</article>

			{process.env.NODE_ENV === 'development' && (
				<button
					type="button"
					onClick={() => setShowEditor(true)}
					className="fixed bottom-6 right-6 cinematic-accent-btn px-6 py-3 rounded-full text-sm uppercase tracking-widest"
				>
					Edit this blog
				</button>
			)}

			{showEditor && (
				<BlogEditor
					post={post}
					close={() => setShowEditor(false)}
					refresh={() => router.reload(window.location.pathname)}
				/>
			)}
		</CinematicLayout>
	)
}

export async function getStaticProps({ params }) {
	const post = getPostBySlug(params.slug, [
		'date',
		'slug',
		'preview',
		'title',
		'tagline',
		'image',
		'content',
	])

	return {
		props: {
			post: {
				...post,
			},
		},
	}
}

export async function getStaticPaths() {
	const posts = getAllPosts(['slug'])

	return {
		paths: posts.map((post) => ({
			params: { slug: post.slug },
		})),
		fallback: false,
	}
}

export default BlogPost

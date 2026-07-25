import Head from 'next/head'
import Link from 'next/link'
import CinematicNav from '../CinematicNav'
import data from '../../../data/portfolio.json'

export default function CinematicLayout({ children, title, description }) {
	const pageTitle = title ? `${title} — ${data.name}` : data.name

	return (
		<div className="cinematic-theme min-h-screen bg-[#0a0a0a] text-white">
			<Head>
				<title>{pageTitle}</title>
				{description && <meta name="description" content={description} />}
			</Head>
			<CinematicNav />
			<main className="cinematic-subpage pt-28 pb-20 px-5 tablet:px-12 max-w-5xl mx-auto">
				{children}
			</main>
			<footer className="cinematic-subpage-footer border-t border-white/10 py-8 px-5 tablet:px-12 text-center text-white/30 text-sm">
				<Link href="/" passHref>
					<a className="hover:text-[var(--cinematic-accent)] transition-colors">Back to home</a>
				</Link>
				<p className="mt-2">&copy; {new Date().getFullYear()} {data.name}</p>
			</footer>
		</div>
	)
}

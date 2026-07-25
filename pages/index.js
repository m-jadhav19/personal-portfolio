import { useRef } from 'react'
import Head from 'next/head'
import data from '../data/portfolio.json'
import { useLenisRef } from '../hooks/useLenisRef'
import CinematicNav from '../components/cinematic/CinematicNav'
import DitheredPageBackground from '../components/cinematic/DitheredPageBackground'
import HeroChapter from '../components/cinematic/HeroChapter'
import WorkChapter from '../components/cinematic/WorkChapter'
import AboutChapter from '../components/cinematic/AboutChapter'
import ContactChapter from '../components/cinematic/ContactChapter'
import ChapterProgress from '../components/cinematic/ChapterProgress'

export default function Home() {
	const pageRef = useRef(null)
	const { scrollTo } = useLenisRef()

	const handleNavigate = (href) => {
		scrollTo(href)
	}

	return (
		<div className="cinematic-theme relative min-h-screen text-white">
			<Head>
				<title>{data.name} — {data.headerTaglineThree}</title>
				<meta name="description" content={data.aboutParaLine1} />
			</Head>

			<DitheredPageBackground pageRef={pageRef} />

			<CinematicNav onNavigate={handleNavigate} />
			<ChapterProgress />

			<div ref={pageRef} className="relative z-10">
				<section className="intro-chapter relative min-h-screen">
					<HeroChapter onNavigate={handleNavigate} />
				</section>

				<WorkChapter />
				<AboutChapter />
				<ContactChapter />
			</div>
		</div>
	)
}

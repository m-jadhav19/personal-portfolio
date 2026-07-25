import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import CinematicLayout from '../components/cinematic/CinematicLayout'
import data from '../data/portfolio.json'

const Resume = () => {
	const router = useRouter()
	const [mount, setMount] = useState(false)
	const { resume, name, showResume } = data

	useEffect(() => {
		setMount(true)
		if (!showResume) {
			router.push('/')
		}
	}, [router, showResume])

	if (!mount || !showResume) return null

	return (
		<CinematicLayout title="Resume" description={resume.description}>
			<div className="mb-12">
				<p className="font-geist-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-4">Resume</p>
				<h1 className="font-space-grotesk text-4xl tablet:text-5xl font-bold mb-4">{name}</h1>
				<p className="text-xl text-white/80 mb-2">{resume.tagline}</p>
				<p className="text-white/50 max-w-2xl">{resume.description}</p>
			</div>

			<section className="mb-12">
				<h2 className="font-space-grotesk text-2xl font-bold mb-6">Experience</h2>
				{resume.experiences.map(({ id, dates, type, position, bullets }) => (
					<div key={id} className="cinematic-resume-card">
						<div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-2 mb-3">
							<h3 className="text-lg font-semibold">{position}</h3>
							<span className="text-sm text-white/40 font-geist-mono">{dates}</span>
						</div>
						<span className="inline-block text-xs uppercase tracking-wider text-[var(--cinematic-accent)] mb-3">{type}</span>
						<ul className="space-y-2 text-white/60">
							{bullets.map((bullet, index) => (
								<li key={index} className="flex gap-2">
									<span className="text-[var(--cinematic-accent)]">—</span>
									{bullet}
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			<section className="mb-12">
				<h2 className="font-space-grotesk text-2xl font-bold mb-6">Education</h2>
				<div className="cinematic-resume-card">
					<h3 className="text-lg font-semibold">{resume.education.universityName}</h3>
					<p className="text-sm text-white/40 font-geist-mono mt-1">{resume.education.universityDate}</p>
					{resume.education.universityPara && (
						<p className="text-white/50 mt-3">{resume.education.universityPara}</p>
					)}
				</div>
			</section>

			<section>
				<h2 className="font-space-grotesk text-2xl font-bold mb-6">Skills</h2>
				<div className="grid tablet:grid-cols-3 gap-6">
					{resume.languages && (
						<div className="cinematic-resume-card">
							<h3 className="text-sm uppercase tracking-wider text-white/40 mb-4">Languages</h3>
							<ul className="space-y-2 text-white/70">
								{resume.languages.map((language, index) => (
									<li key={index}>{language}</li>
								))}
							</ul>
						</div>
					)}
					{resume.frameworks && (
						<div className="cinematic-resume-card">
							<h3 className="text-sm uppercase tracking-wider text-white/40 mb-4">Frameworks</h3>
							<ul className="space-y-2 text-white/70">
								{resume.frameworks.map((framework, index) => (
									<li key={index}>{framework}</li>
								))}
							</ul>
						</div>
					)}
					{resume.others && (
						<div className="cinematic-resume-card">
							<h3 className="text-sm uppercase tracking-wider text-white/40 mb-4">Others</h3>
							<ul className="space-y-2 text-white/70">
								{resume.others.map((other, index) => (
									<li key={index}>{other}</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</section>
		</CinematicLayout>
	)
}

export default Resume

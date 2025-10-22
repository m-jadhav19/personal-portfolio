import Head from 'next/head'
import RetroLayout from '../components/RetroLayout'
import data from '../data/portfolio.json'

export default function Home() {
	return (
		<>
			<Head>
				<title>{data.name} - Retro Portfolio</title>
				<meta name="description" content="Mandar Jadhav - Full Stack Developer with a passion for pixel-perfect design" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect x='4' y='0' width='8' height='2' fill='%232B1B17'/><rect x='3' y='2' width='10' height='1' fill='%232B1B17'/><rect x='4' y='3' width='8' height='4' fill='%23C37553'/><rect x='3' y='4' width='2' height='1' fill='%23231F20'/><rect x='11' y='4' width='2' height='1' fill='%23231F20'/><rect x='5' y='5' width='6' height='1' fill='%23231F20'/><rect x='4' y='7' width='8' height='2' fill='%232B1B17'/><rect x='2' y='9' width='12' height='5' fill='%23C0392B'/></svg>" />
			</Head>
			
			<RetroLayout />
		</>
	)
}

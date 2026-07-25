export default function ScrollChapter({ id, children, className = '', innerClassName = '' }) {
	return (
		<section id={id} className={`scroll-chapter ${className}`} data-chapter={id}>
			<div className={`scroll-chapter-inner ${innerClassName}`}>{children}</div>
		</section>
	)
}

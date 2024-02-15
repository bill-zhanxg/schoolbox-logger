'use client';

export function Test() {
	return (
		<div>
			<h1>Test</h1>
			<p>This is a test component.</p>
			<button
				className="btn"
				onClick={() => {
					fetch('http://localhost:8000', {
                        credentials: 'include',
                    });
				}}
			>
				Test
			</button>
		</div>
	);
}
